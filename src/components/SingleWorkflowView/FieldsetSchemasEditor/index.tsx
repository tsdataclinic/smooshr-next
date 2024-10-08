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

  const { fieldsetSchemas } = form.getValues();

  return (
    <FieldsetSchemasFormProvider form={form}>
      <form
        className="space-y-3"
        onSubmit={form.onSubmit((formValues) => {
          saveFieldsetMutation.mutate(formValues.fieldsetSchemas, {
            onSuccess: () => {
              notifications.show({
                title: 'Saved',
                message: 'Updated column schemas',
              });
            },
          });
        })}
      >
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
                />
              );
            })
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              form.insertListItem(
                'fieldsetSchemas',
                makeEmptyFieldsetSchema(fieldsetSchemas.length + 1),
              );
            }}
          >
            Add new schema
          </Button>

          <Button type="submit" disabled={fieldsetSchemas.length === 0}>
            Save
          </Button>
        </div>
      </form>
    </FieldsetSchemasFormProvider>
  );
}
