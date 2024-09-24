import * as React from 'react';
import { Text, Button } from '@mantine/core';
import { v4 as uuid } from 'uuid';
import type { FullWorkflow, FieldsetSchema_Output } from '../../../client';
import { WorkflowsService } from '../../../client';
import { FieldsetSchemaBlock } from './FieldsetSchemaBlock';
import { WorkflowUtil } from '../../../util/WorkflowUtil';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { processAPIData } from '../../../util/apiUtil';
import { notifications } from '@mantine/notifications';

function makeEmptyFieldsetSchema(idx: number): FieldsetSchema_Output {
  return {
    id: uuid(),
    name: idx === 1 ? 'New schema' : `New schema ${idx}`,
    orderMatters: true,
    fields: [],
    allowExtraColumns: 'no',
  };
}

type Props = {
  workflow: FullWorkflow;
  defaultFieldsetSchemas: readonly FieldsetSchema_Output[];
};

export function FieldsetSchemasEditor({
  workflow,
  defaultFieldsetSchemas,
}: Props): JSX.Element {
  const queryClient = useQueryClient();
  const saveFieldsetMutation = useMutation({
    mutationFn: async (fieldsetSchemas: readonly FieldsetSchema_Output[]) => {
      const workflowToSave = WorkflowUtil.updateFieldsetSchemas(
        workflow,
        fieldsetSchemas,
      );
      console.log('workflow to save', workflowToSave);
      const savedWorkflow = await processAPIData(
        WorkflowsService.updateWorkflow({
          path: {
            workflow_id: workflowToSave.id,
          },
          body: workflowToSave,
        }),
      );
      return savedWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: WorkflowUtil.QUERY_KEYS.workflow(workflow.id),
      });
    },
  });

  const [fieldsetSchemas, setFieldsetSchemas] = React.useState<
    readonly FieldsetSchema_Output[]
  >(defaultFieldsetSchemas);

  const onFieldsetSchemaDelete = React.useCallback(
    (schemaToDelete: FieldsetSchema_Output) => {
      setFieldsetSchemas((prevSchemas) => {
        return prevSchemas.filter((schema) => schema.id !== schemaToDelete.id);
      });
    },
    [],
  );

  const onFieldsetSchemaChange = React.useCallback(
    (newSchema: FieldsetSchema_Output) => {
      setFieldsetSchemas((prevSchemas) => {
        return prevSchemas.map((schema) =>
          schema.id === newSchema.id ? newSchema : schema,
        );
      });
    },
    [],
  );

  return (
    <div className="space-y-2">
      <Button
        onClick={() =>
          setFieldsetSchemas((prevSchemas) =>
            prevSchemas.concat(makeEmptyFieldsetSchema(prevSchemas.length + 1)),
          )
        }
      >
        Create new schema
      </Button>

      <div className="space-y-2">
        {fieldsetSchemas.length === 0 ? (
          <Text>No schemas created yet</Text>
        ) : (
          fieldsetSchemas.map((schema, i) => {
            return (
              <FieldsetSchemaBlock
                key={schema.id}
                fieldsetSchema={fieldsetSchemas[i]}
                onFieldsetSchemaDelete={onFieldsetSchemaDelete}
                onFieldsetSchemaChange={onFieldsetSchemaChange}
              />
            );
          })
        )}
      </div>

      <Button
        disabled={fieldsetSchemas.length === 0}
        onClick={() => {
          saveFieldsetMutation.mutate(fieldsetSchemas, {
            onSuccess: () => {
              console.log('success!');
              notifications.show({
                title: 'Saved',
                message: 'Updated column schemas',
              });
            },
          });
        }}
      >
        Save
      </Button>
    </div>
  );
}
