import * as R from 'remeda';
import * as React from 'react';
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
  Space,
} from '@mantine/core';
import * as Papa from 'papaparse';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { FieldSchemaRow } from './FieldSchemaRow';
import { FieldSchema, FieldsetSchema_Output } from '../../../client';
import { useField } from '@mantine/form';
import { InfoIcon } from '../../ui/InfoIcon';

type Props = {
  fieldsetSchema: FieldsetSchema_Output;
  index: number;
  onFieldsetSchemaChange: (
    index: number,
    fieldsetSchema: FieldsetSchema_Output,
  ) => void;
  onFieldsetSchemaDelete: (index: number) => void;
};

const ALLOW_EXTRA_COLUMNS_OPTIONS = [
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
] as const;

const ALLOW_EXTRA_COLUMNS_VALUES = ALLOW_EXTRA_COLUMNS_OPTIONS.map(
  (option) => option.value,
);

export function FieldsetSchemaBlock({
  fieldsetSchema,
  index,
  onFieldsetSchemaChange,
  onFieldsetSchemaDelete,
}: Props): JSX.Element {
  const nameField = useField({ initialValue: fieldsetSchema.name });
  const orderMattersField = useField({
    initialValue: fieldsetSchema.orderMatters,
    type: 'checkbox',
  });
  const allowExtraColumnsField = useField({
    initialValue: fieldsetSchema.allowExtraColumns,
  });

  const onFieldSchemaChange = React.useCallback(
    (fieldIdx: number, fieldSchema: FieldSchema) => {
      // update fieldschema according to index
      const newFieldsetSchema: FieldsetSchema_Output = {
        ...fieldsetSchema,
        fields: [
          ...fieldsetSchema.fields.slice(0, fieldIdx),
          fieldSchema,
          ...fieldsetSchema.fields.slice(fieldIdx + 1),
        ],
      };
      onFieldsetSchemaChange(index, newFieldsetSchema);
    },
    [fieldsetSchema, index, onFieldsetSchemaChange],
  );

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete schema',
      children: (
        <Text size="sm">Are you sure you want to delete this schema?</Text>
      ),
      labels: { confirm: 'Delete schema', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onFieldsetSchemaDelete(index);
      },
    });

  const onCSVUpload = (file: File | null) => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (parsedResult): void => {
          const newFieldsetSchema: FieldsetSchema_Output = {
            ...fieldsetSchema,
            name: file.name,
            fields:
              parsedResult.meta.fields?.map((header: string) => {
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
          };

          onFieldsetSchemaChange(index, newFieldsetSchema);
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
              <Table.Th className="flex">
                Allowed values
                <Space w="4px" />
                <InfoIcon
                  tooltip="This feature is not implemented yet"
                  color="red"
                />
              </Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {fields.map((fieldSchema, i) => {
              return (
                <FieldSchemaRow
                  key={fieldSchema.id}
                  fieldSchema={fieldSchema}
                  fieldIndex={i}
                  onFieldSchemaChange={onFieldSchemaChange}
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
            {...nameField.getInputProps()}
            label="Ruleset Name"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newName = e.currentTarget.value;
              nameField.getInputProps().onChange(newName);
              onFieldsetSchemaChange(index, {
                ...fieldsetSchema,
                name: newName,
              });
            }}
          />

          {fieldsetSchema.fields.length === 0 ? (
            <FileButton onChange={onCSVUpload} accept=".csv">
              {(props) => (
                <Button {...props}>Get column schema from CSV</Button>
              )}
            </FileButton>
          ) : (
            <>
              {renderHeadersMetadataTable()}
              <Checkbox
                {...orderMattersField.getInputProps()}
                label="Order of columns matters"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newOrderMatters = e.currentTarget.checked;
                  orderMattersField.getInputProps().onChange(newOrderMatters);
                  onFieldsetSchemaChange(index, {
                    ...fieldsetSchema,
                    orderMatters: newOrderMatters,
                  });
                }}
              />
              <Select
                {...allowExtraColumnsField.getInputProps()}
                allowDeselect={false}
                data={ALLOW_EXTRA_COLUMNS_OPTIONS}
                label="Allow extra columns"
                onChange={(value: string | null) => {
                  if (R.isIncludedIn(value, ALLOW_EXTRA_COLUMNS_VALUES)) {
                    allowExtraColumnsField.getInputProps().onChange(value);
                    onFieldsetSchemaChange(index, {
                      ...fieldsetSchema,
                      allowExtraColumns: value,
                    });
                  }
                }}
              />
            </>
          )}
        </div>
      </Fieldset>
    </>
  );
}
