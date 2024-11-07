import { TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FieldsetSchemaValidation, FullWorkflow } from '../../../../client';
import { v4 as uuid } from 'uuid';
import { WorkflowUtil } from '../../../../util/WorkflowUtil';
import { FieldsetSchemaSelect } from './FieldsetSchemaSelect';
import { useWorkflowModelContext } from '../../WorkflowModelContext';

type Props = {
  workflow: FullWorkflow;
  onClose: () => void;
};

export function FieldsetSchemaValidationEditor({
  workflow,
  onClose,
}: Props): JSX.Element {
  const workflowModel = useWorkflowModelContext();

  const fieldsetSchemaValidationForm = useForm<FieldsetSchemaValidation>({
    mode: 'uncontrolled',
    initialValues: {
      type: 'fieldsetSchemaValidation',
      id: uuid(),
      title: 'Apply column rulesets',
      description: '',
      fieldsetSchema: '',
    },
  });

  return (
    <form
      onSubmit={fieldsetSchemaValidationForm.onSubmit(
        (validationConfig: FieldsetSchemaValidation) => {
          const workflowToSave = workflow.schema.operations.find(
            (op) => op.id === validationConfig.id,
          )
            ? WorkflowUtil.updateOperation(workflow, validationConfig)
            : WorkflowUtil.insertOperation(workflow, validationConfig);

          // update the form model
          workflowModel.setValues(workflowToSave);
          onClose();
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

      <FieldsetSchemaSelect
        key={fieldsetSchemaValidationForm.key('fieldsetSchema')}
        {...fieldsetSchemaValidationForm.getInputProps('fieldsetSchema')}
        fieldsetSchemas={workflow.schema.fieldsetSchemas}
        workflowParams={workflow.schema.params}
      />

      <Button type="submit">Add</Button>
    </form>
  );
}
