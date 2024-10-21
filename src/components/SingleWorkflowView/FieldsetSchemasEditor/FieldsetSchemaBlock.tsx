import { v4 as uuid } from 'uuid';
import {
  Table,
  Text,
  TextInput,
  Checkbox,
  Fieldset,
  FileButton,
  Button,
  ActionIcon,
  Select,
  ComboboxItem,
} from '@mantine/core';
import * as Papa from 'papaparse';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import type { FieldsetSchema_Output } from '../../../client';
import { FieldSchemaRow } from './FieldSchemaRow';
import { useFieldsetSchemasFormContext } from './FieldsetSchemasContext';

type Props = {
  fieldsetSchema: FieldsetSchema_Output;
  index: number;
};

const ALLOW_EXTRA_COLUMNS_OPTIONS: ComboboxItem[] = [
  {
    value: 'no',
    label: 'No',
  },
  {
    value: 'anywhere',
    label: 'Anywhere',
  },
  {
    value: 'onlyAfterSchemaFields',
    label: 'Only after schema fields',
  },
];

export function FieldsetSchemaBlock({
  fieldsetSchema,
  index,
}: Props): JSX.Element {
  const form = useFieldsetSchemasFormContext();

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
        },
      });
    }
  };

  const renderHeadersMetadataTable = () => {
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

    return <Text>This schema contains no columns.</Text>;
  };

  return (
    <>
      <Fieldset
        className="relative"
        legend={<Text>{fieldsetSchema.name}</Text>}
      >
        <ActionIcon
          aria-label="Delete Column Rule"
          variant="transparent"
          className="absolute -top-1 right-1"
          color="dark"
          size="sm"
          onClick={openDeleteModal}
        >
          <IconTrash />
        </ActionIcon>

        <div className="space-y-3">
          <TextInput
            key={form.key(`fieldsetSchemas.${index}.name`)}
            {...form.getInputProps(`fieldsetSchemas.${index}.name`)}
            label="Schema Name"
          />

          {fieldsetSchema.fields.length === 0 ? (
            <FileButton onChange={onCSVUpload} accept=".csv">
              {(props) => (
                <Button {...props}>Get column schema from CSV</Button>
              )}
            </FileButton>
          ) : (
            <>
              <Select
                key={form.key(`fieldsetSchemas.${index}.allowExtraColumns`)}
                {...form.getInputProps(
                  `fieldsetSchemas.${index}.allowExtraColumns`,
                )}
                data={ALLOW_EXTRA_COLUMNS_OPTIONS}
                label="Allow extra columns"
              />
              <Checkbox
                key={form.key(`fieldsetSchemas.${index}.orderMatters`)}
                {...form.getInputProps(
                  `fieldsetSchemas.${index}.orderMatters`,
                  {
                    type: 'checkbox',
                  },
                )}
                label="Order of columns matters"
              />

              {renderHeadersMetadataTable()}
            </>
          )}
        </div>
      </Fieldset>
    </>
  );
}
