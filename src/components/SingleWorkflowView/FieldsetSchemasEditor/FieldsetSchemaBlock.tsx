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
import { FieldSchemaRow } from './FieldSchemaRow';
import { useWorkflowModelContext } from '../WorkflowModelContext';
import { WorkflowUtil } from '../../../util/WorkflowUtil';
import { FieldsetSchema_Output } from '../../../client';

type Props = {
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

export function FieldsetSchemaBlock({ index }: Props): JSX.Element {
  const fieldsetSchemaPath = `schema.fieldsetSchemas.${index}`;
  const workflowModel = useWorkflowModelContext();
  const fieldsetSchema =
    workflowModel.getValues().schema.fieldsetSchemas[index];

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete schema',
      children: (
        <Text size="sm">Are you sure you want to delete this schema?</Text>
      ),
      labels: { confirm: 'Delete schema', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        const newWorkflow = WorkflowUtil.removeFieldsetSchemaByIndex(
          workflowModel.getValues(),
          index,
        );
        workflowModel.setValues(newWorkflow);
      },
    });

  const onCSVUpload = (file: File | null) => {
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (parsedResult): void => {
          const newWorkflow = WorkflowUtil.updateFieldsetSchemaByIndex(
            workflowModel.getValues(),
            index,
            (prevFieldsetSchema: FieldsetSchema_Output) => {
              return {
                ...prevFieldsetSchema,
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
              };
            },
          );

          workflowModel.setValues(newWorkflow);
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
            key={workflowModel.key(`${fieldsetSchemaPath}.name`)}
            {...workflowModel.getInputProps(`${fieldsetSchemaPath}.name`)}
            label="Ruleset Name"
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
                key={workflowModel.key(`${fieldsetSchemaPath}.orderMatters`)}
                {...workflowModel.getInputProps(
                  `${fieldsetSchemaPath}.orderMatters`,
                  {
                    type: 'checkbox',
                  },
                )}
                label="Order of columns matters"
              />
              <Select
                key={workflowModel.key(
                  `${fieldsetSchemaPath}.allowExtraColumns`,
                )}
                {...workflowModel.getInputProps(
                  `${fieldsetSchemaPath}.allowExtraColumns`,
                )}
                data={ALLOW_EXTRA_COLUMNS_OPTIONS}
                label="Allow extra columns"
              />
            </>
          )}
        </div>
      </Fieldset>
    </>
  );
}
