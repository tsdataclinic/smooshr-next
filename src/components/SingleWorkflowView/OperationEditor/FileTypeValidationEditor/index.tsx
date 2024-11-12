import { useForm } from '@mantine/form';
import { Box, Button, Select, Stack, TextInput } from '@mantine/core';
import { FileTypeValidation } from '../../../../client';

type Props = {
  mode: 'add' | 'update';
  onAddOperation: (operation: FileTypeValidation) => void;
  onUpdateOperation: (operation: FileTypeValidation) => void;
  onClose: () => void;
  defaultOperation: FileTypeValidation;
};

const FILE_TYPE_OPTIONS = [{ value: '.csv', label: 'CSV' }];

export function FileTypeValidationEditor({
  mode,
  onClose,
  onAddOperation,
  onUpdateOperation,
  defaultOperation,
}: Props): JSX.Element {
  const fileTypeValidationForm = useForm<FileTypeValidation>({
    mode: 'uncontrolled',
    initialValues: defaultOperation,
  });

  return (
    <form
      onSubmit={fileTypeValidationForm.onSubmit(
        (operationConfig: FileTypeValidation) => {
          if (mode === 'add') {
            onAddOperation(operationConfig);
          } else {
            onUpdateOperation(operationConfig);
          }
          onClose();
        },
      )}
    >
      <Stack>
        <TextInput
          key={fileTypeValidationForm.key('title')}
          {...fileTypeValidationForm.getInputProps('title')}
          required
          label="Custom Title"
        />
        <TextInput
          key={fileTypeValidationForm.key('description')}
          {...fileTypeValidationForm.getInputProps('description')}
          label="Description"
        />
        <Select
          key={fileTypeValidationForm.key('expectedFileType')}
          {...fileTypeValidationForm.getInputProps('expectedFileType')}
          required
          allowDeselect={false}
          label="File Type"
          description="Only CSV is supported for now"
          placeholder="Select a file type"
          data={FILE_TYPE_OPTIONS}
        />
        <Box>
          <Button type="submit">{mode === 'add' ? 'Add' : 'Update'}</Button>
        </Box>
      </Stack>
    </form>
  );
}
