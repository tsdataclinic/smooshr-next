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
import {
  useFieldsetSchemasForm,
  FieldsetSchemasFormProvider,
} from './FieldsetSchemasContext';

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
  const form = useFieldsetSchemasForm({
    mode: 'controlled',
    initialValues: {
      fieldsetSchemas: defaultFieldsetSchemas as FieldsetSchema_Output[],
    },
  });

  const queryClient = useQueryClient();
  const saveFieldsetMutation = useMutation({
    mutationFn: async (fieldsetSchemas: readonly FieldsetSchema_Output[]) => {
      const workflowToSave = WorkflowUtil.updateFieldsetSchemas(
        workflow,
        fieldsetSchemas,
      );
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

  const onLoadFieldsetFromCSV = React.useCallback(
    (newSchema: FieldsetSchema_Output) => {
      console.log('new schema', newSchema);
      alert('Needs implementation');
      /*
      setFieldsetSchemas((prevSchemas) => {
        return prevSchemas.map((schema) =>
          schema.id === newSchema.id ? newSchema : schema,
        );
      });
      */
    },
    [],
  );

  const { fieldsetSchemas } = form.getValues();

  return (
    <div className="space-y-2">
      <FieldsetSchemasFormProvider form={form}>
        <form>
          <Button
            onClick={() => {
              form.insertListItem(
                'fieldsetSchemas',
                makeEmptyFieldsetSchema(fieldsetSchemas.length + 1),
              );
            }}
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
                    index={i}
                    fieldsetSchema={fieldsetSchemas[i]}
                    onLoadFieldsetFromCSV={onLoadFieldsetFromCSV}
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
        </form>
      </FieldsetSchemasFormProvider>
    </div>
  );
}
