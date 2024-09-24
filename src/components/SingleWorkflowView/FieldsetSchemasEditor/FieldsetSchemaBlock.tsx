import { v4 as uuid } from 'uuid';
import {
  Modal,
  Menu,
  Text,
  TextInput,
  Checkbox,
  Fieldset,
  Title,
  FileButton,
  UnstyledButton,
  List,
  Button,
} from '@mantine/core';
import * as Papa from 'papaparse';
import { IconSettingsFilled } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import { type FieldsetSchema } from '../../../client';

type Props = {
  fieldsetSchema: FieldsetSchema;
  onFieldsetSchemaDelete: (fieldsetSchema: FieldsetSchema) => void;
  onFieldsetSchemaChange: (newFieldsetSchema: FieldsetSchema) => void;
};

export function FieldsetSchemaBlock({
  fieldsetSchema,
  onFieldsetSchemaDelete,
  onFieldsetSchemaChange,
}: Props): JSX.Element {
  const [isCSVParseModalOpen, csvParseModalActions] = useDisclosure(false);
  const form = useForm({
    mode: 'controlled',
    initialValues: fieldsetSchema,
  });

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete schema',
      children: (
        <Text size="sm">Are you sure you want to delete this schema?</Text>
      ),
      labels: { confirm: 'Delete schema', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => onFieldsetSchemaDelete(fieldsetSchema),
    });

  const onCSVUpload = (file: File | null) => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (parsedResult): void => {
          onFieldsetSchemaChange({
            ...fieldsetSchema,
            name: file.name,
            fields:
              parsedResult.meta.fields?.map((header) => {
                return {
                  id: uuid(),
                  name: header,
                  caseSensitive: true,
                  required: true,
                  dataTypeValidation: {
                    dataType: 'any',
                  },
                  allowEmptyValues: false,
                  allowedValues: [],
                };
              }) ?? [],
          });
        },
      });
    }
  };

  return (
    <>
      <form>
        <Fieldset className="relative" legend={form.getValues().name}>
          <Menu withArrow shadow="md" width={250} position="bottom-start">
            <Menu.Target>
              <UnstyledButton
                className="absolute -top-1 right-1"
                onClick={() => console.log('clicked')}
              >
                <IconSettingsFilled size={16} />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={csvParseModalActions.open}>
                Generate schema from CSV
              </Menu.Item>
              <Menu.Item onClick={openDeleteModal}>Delete schema</Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <div className="space-y-2">
            <TextInput {...form.getInputProps('name')} label="Schema Name" />
            <Checkbox
              {...form.getInputProps('orderMatters', { type: 'checkbox' })}
              label="Order of columns matters"
            />
            <Title order={6}>Headers</Title>
            <List>
              {fieldsetSchema.fields.map((field) => {
                return (
                  <List.Item key={field.name}>
                    {field.name}: datatype [add validators]
                  </List.Item>
                );
              })}
            </List>
          </div>
        </Fieldset>
      </form>

      <Modal
        opened={isCSVParseModalOpen}
        onClose={csvParseModalActions.close}
        title="Get Schema from CSV"
      >
        <div>
          <FileButton onChange={onCSVUpload} accept=".csv">
            {(props) => <Button {...props}>Create new schema from CSV</Button>}
          </FileButton>
        </div>
      </Modal>
    </>
  );
}
