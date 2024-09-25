import { TextInput, Button, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  FieldsetSchemaValidation,
  FieldsetSchema_Output,
  FullWorkflow,
  WorkflowsService,
} from '../../../../client';
import { v4 as uuid } from 'uuid';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { WorkflowUtil } from '../../../../util/WorkflowUtil';
import { processAPIData } from '../../../../util/apiUtil';
import { notifications } from '@mantine/notifications';

type Props = {
  workflow: FullWorkflow;
};

export function FieldsetSchemaValidationEditor({
  workflow,
}: Props): JSX.Element {
  const queryClient = useQueryClient();
  const saveValidationMutation = useMutation({
    mutationFn: async (validationConfig: FieldsetSchemaValidation) => {
      const workflowToSave = workflow.schema.operations.find(
        (op) => op.id === validationConfig.id,
      )
        ? WorkflowUtil.updateOperation(workflow, validationConfig)
        : WorkflowUtil.insertOperation(workflow, validationConfig);

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

  const fieldsetSchemaValidationForm = useForm<FieldsetSchemaValidation>({
    mode: 'uncontrolled',
    initialValues: {
      type: 'fieldsetSchemaValidation',
      id: uuid(),
      title: 'Validate column schemas',
      description: '',
      fieldsetSchema: '',
    },
  });

  const fieldsetSchemaOptions = workflow.schema.fieldsetSchemas.map(
    (fieldSchema: FieldsetSchema_Output) => {
      return { value: fieldSchema.id, label: fieldSchema.name };
    },
  );

  return (
    <form
      onSubmit={fieldsetSchemaValidationForm.onSubmit(
        (validationConfig: FieldsetSchemaValidation) => {
          saveValidationMutation.mutate(validationConfig, {
            onSuccess: () => {
              notifications.show({
                title: 'Saved',
                message: 'Updated validations',
              });
            },
          });
        },
      )}
      className="space-y-2"
    >
      <TextInput
        required
        key={fieldsetSchemaValidationForm.key('title')}
        {...fieldsetSchemaValidationForm.getInputProps('title')}
        label="Custom Title"
      />
      <TextInput
        key={fieldsetSchemaValidationForm.key('description')}
        {...fieldsetSchemaValidationForm.getInputProps('description')}
        label="Description"
      />
      <Select
        required
        key={fieldsetSchemaValidationForm.key('fieldsetSchema')}
        {...fieldsetSchemaValidationForm.getInputProps('fieldsetSchema')}
        label="Column Schema"
        data={fieldsetSchemaOptions}
        placeholder="Select a column schema to use"
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
