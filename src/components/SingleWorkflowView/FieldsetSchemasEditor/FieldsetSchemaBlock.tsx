import * as React from 'react';
import { v4 as uuid } from 'uuid';
import {
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

// TODO: eventually this should come from backend
export type FieldsetSchema = {
  id: string;
  name: string;
  orderMatters: boolean;
  fields: ReadonlyArray<{
    name: string;
  }>;
};

type Props = {
  fieldsetSchema: FieldsetSchema;
  onFieldsetSchemaDelete: (FieldsetSchema) => void;
};

function useCSVFieldsetParser(): [
  FieldsetSchema | undefined,
  (file: File | null) => void,
] {
  const [fieldsetSchema, setFieldsetSchema] = React.useState<
    FieldsetSchema | undefined
  >(undefined);

  const setCSVInfo = React.useCallback((file: File | null) => {
    if (file) {
      Papa.parse(file, {
        complete: (parsedResult): void => {
          setFieldsetSchema({
            id: uuid(),
            name: file.name,
            orderMatters: true,
            fields:
              parsedResult.meta.fields?.map((header) => {
                return {
                  name: header,
                };
              }) ?? [],
          });
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  }, []);

  return [fieldsetSchema, setCSVInfo];
}

export function FieldsetSchemaBlock({
  fieldsetSchema,
  onFieldsetSchemaDelete,
}: Props): JSX.Element {
  const [, setParsedFieldsetSchema] = useCSVFieldsetParser();
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

  // TODO: YOU ARE HERE. We should say "Either create manually or upload CSV to extract reference"
  if (fieldsetSchema === undefined) {
    return (
      <div>
        Create manually or add CSV
        <FileButton onChange={setParsedFieldsetSchema} accept=".csv">
          {(props) => <Button {...props}>Create new schema from CSV</Button>}
        </FileButton>
      </div>
    );
  }

  return (
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
            <Menu.Item disabled>Generate schema from CSV</Menu.Item>
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
  );
}
