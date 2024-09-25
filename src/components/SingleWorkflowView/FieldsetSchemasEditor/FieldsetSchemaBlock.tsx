import { v4 as uuid } from 'uuid';
import {
  Table,
  Modal,
  Menu,
  Text,
  TextInput,
  Checkbox,
  Fieldset,
  FileButton,
  Button,
  ActionIcon,
} from '@mantine/core';
import * as Papa from 'papaparse';
import { IconSettingsFilled } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import type { FieldsetSchema_Output } from '../../../client';
import { FieldSchemaRow } from './FieldSchemaRow';
import { useFieldsetSchemasFormContext } from './FieldsetSchemasContext';

type Props = {
  fieldsetSchema: FieldsetSchema_Output;
  index: number;
};

// TODO: add "allow extra columns" Select
export function FieldsetSchemaBlock({
  fieldsetSchema,
  index,
}: Props): JSX.Element {
  const form = useFieldsetSchemasFormContext();
  const [isCSVParseModalOpen, csvParseModalActions] = useDisclosure(false);

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete schema',
      children: (
        <Text size="sm">Are you sure you want to delete this schema?</Text>
      ),
      labels: { confirm: 'Delete schema', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        form.removeListItem('fieldsetSchemas', index);
      },
    });

  const onCSVUpload = (file: File | null) => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (parsedResult): void => {
          form.setFieldValue(`fieldsetSchemas.${index}`, {
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

          csvParseModalActions.close();
        },
      });
    }
  };

  const renderHeadersInfoTable = () => {
    const { fields } = fieldsetSchema;
    if (fields.length > 0) {
      return (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Column name</Table.Th>
              <Table.Th>Required</Table.Th>
              <Table.Th>Data type</Table.Th>
              <Table.Th>Case sensitive</Table.Th>
              <Table.Th>Allows empty values</Table.Th>
              <Table.Th>Allowed values</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {fields.map((fieldSchema, i) => {
              return (
                <FieldSchemaRow
                  key={fieldSchema.id}
                  fieldSchema={fieldSchema}
                  fieldsetIndex={index}
                  index={i}
                />
              );
            })}
          </Table.Tbody>
        </Table>
      );
    }

    return <Text>This schema contains no columns yet.</Text>;
  };

  return (
    <>
      <Fieldset
        className="relative"
        legend={<Text>{fieldsetSchema.name}</Text>}
      >
        <Menu withArrow shadow="md" width={250} position="left">
          <Menu.Target>
            <ActionIcon
              variant="transparent"
              className="absolute -top-1 right-1"
              color="dark"
              size="sm"
            >
              <IconSettingsFilled />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={csvParseModalActions.open}>
              Generate schema from CSV
            </Menu.Item>
            <Menu.Item onClick={openDeleteModal}>Delete schema</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <div className="space-y-2">
          <TextInput
            {...form.getInputProps(`fieldsetSchemas.${index}.name`)}
            label="Schema Name"
          />
          <Checkbox
            {...form.getInputProps(`fieldsetSchemas.${index}.orderMatters`, {
              type: 'checkbox',
            })}
            label="Order of columns matters"
          />
          {renderHeadersInfoTable()}
        </div>
      </Fieldset>

      <Modal
        opened={isCSVParseModalOpen}
        onClose={csvParseModalActions.close}
        title="Get Schema from CSV"
      >
        <div>
          <FileButton onChange={onCSVUpload} accept=".csv">
            {(props) => <Button {...props}>Get column schema from CSV</Button>}
          </FileButton>
        </div>
      </Modal>
    </>
  );
}
