import { TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  FieldsetSchema_Output,
  FieldsetSchemaValidation,
  WorkflowParam,
} from '../../../../client';
import { FieldsetSchemaSelect } from './FieldsetSchemaSelect';

type Props = {
  mode: 'add' | 'update';
  onAddOperation: (operation: FieldsetSchemaValidation) => void;
  onUpdateOperation: (operation: FieldsetSchemaValidation) => void;
  onClose: () => void;
  fieldsetSchemas: FieldsetSchema_Output[];
  workflowParams: WorkflowParam[];
  defaultOperation: FieldsetSchemaValidation;
};

export function FieldsetSchemaValidationEditor({
  mode,
  onClose,
  onAddOperation,
  onUpdateOperation,
  fieldsetSchemas,
  workflowParams,
  defaultOperation,
}: Props): JSX.Element {
  const fieldsetSchemaValidationForm = useForm<FieldsetSchemaValidation>({
    mode: 'uncontrolled',
    initialValues: defaultOperation,
  });

  return (
    <form
      onSubmit={fieldsetSchemaValidationForm.onSubmit(
        (operationConfig: FieldsetSchemaValidation) => {
          if (mode === 'add') {
            onAddOperation(operationConfig);
          } else {
            onUpdateOperation(operationConfig);
          }
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
        fieldsetSchemas={fieldsetSchemas}
        workflowParams={workflowParams}
      />

      <Button type="submit">{mode === 'add' ? 'Add' : 'Update'}</Button>
    </form>
  );
}
