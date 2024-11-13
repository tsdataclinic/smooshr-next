import pluralize from 'pluralize';
import {
  ActionIcon,
  Text,
  Table,
  TextInput,
  Checkbox,
  Select,
  ComboboxItem,
  TagsInput,
  Group,
} from '@mantine/core';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { FieldSchema, ParamReference } from '../../../client';
import { useDisclosure } from '@mantine/hooks';
import { useField } from '@mantine/form';
import { modals } from '@mantine/modals';

type Props = {
  fieldIndex: number;
  fieldSchema: FieldSchema;
  onFieldSchemaChange: (index: number, fieldSchema: FieldSchema) => void;
};

const DATA_TYPE_OPTIONS: ComboboxItem[] = [
  {
    value: 'any',
    label: 'Any',
  },
  {
    value: 'string',
    label: 'String',
  },
  {
    value: 'number',
    label: 'Number',
  },
  {
    value: 'timestamp',
    label: 'Timestamp',
  },
];

function booleanToString(val: boolean): string {
  return val ? 'Yes' : 'No';
}

function allowedValueListToString(
  allowedValues: string[] | ParamReference | null,
): string {
  const EMPTY = '--';

  if (allowedValues === null) {
    return EMPTY;
  }

  if (Array.isArray(allowedValues)) {
    return allowedValues.length === 0
      ? EMPTY
      : pluralize('values', allowedValues.length, true);
  }

  return allowedValues.paramId;
}

export function FieldSchemaRow({
  fieldSchema,
  fieldIndex,
  onFieldSchemaChange,
}: Props): JSX.Element {
  const [isEditModeOn, editModeActions] = useDisclosure(false);
  const nameField = useField({ initialValue: fieldSchema.name });
  const isRequiredField = useField({
    initialValue: fieldSchema.required,
    type: 'checkbox',
  });
  const dataTypeField = useField({
    initialValue: fieldSchema.dataTypeValidation.dataType,
  });
  const isCaseSensitiveField = useField({
    initialValue: fieldSchema.caseSensitive,
    type: 'checkbox',
  });
  const allowEmptyValuesField = useField({
    initialValue: fieldSchema.allowEmptyValues,
    type: 'checkbox',
  });
  const allowedValuesField = useField({
    initialValue: Array.isArray(fieldSchema.allowedValues)
      ? fieldSchema.allowedValues
      : undefined,
  });

  const openAllowedValuesModal = () =>
    modals.openConfirmModal({
      title: 'Allowed values',
      children: <TagsInput {...allowedValuesField.getInputProps()} />,
      labels: { confirm: 'Save', cancel: 'Cancel' },
      confirmProps: { color: 'blue' },
    });

  const nameColumn = isEditModeOn ? (
    <TextInput {...nameField.getInputProps()} />
  ) : (
    <Text size="sm">{fieldSchema.name}</Text>
  );

  const isRequiredColumn = isEditModeOn ? (
    <Checkbox {...isRequiredField.getInputProps()} />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.required)}</Text>
  );

  const dataTypeColumn = isEditModeOn ? (
    <Select {...dataTypeField.getInputProps()} data={DATA_TYPE_OPTIONS} />
  ) : (
    <Text tt="capitalize" size="sm">
      {fieldSchema.dataTypeValidation.dataType}
    </Text>
  );

  const isCaseSensitiveColumn = isEditModeOn ? (
    <Checkbox {...isCaseSensitiveField.getInputProps()} />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.caseSensitive)}</Text>
  );

  const allowEmptyValuesColumn = isEditModeOn ? (
    <Checkbox {...allowEmptyValuesField.getInputProps()} />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.allowEmptyValues)}</Text>
  );

  const allowedValuesColumn = isEditModeOn ? (
    <Text size="sm">
      <Group>
        {allowedValueListToString(fieldSchema.allowedValues)}
        {isEditModeOn ? (
          <ActionIcon
            aria-label="Edit allowed values"
            variant="transparent"
            color="dark"
            size="sm"
          >
            <IconEdit
              onClick={() => {
                openAllowedValuesModal();
              }}
            />
          </ActionIcon>
        ) : (
          ''
        )}
      </Group>
    </Text>
  ) : (
    <Text size="sm">{allowedValueListToString(fieldSchema.allowedValues)}</Text>
  );

  return (
    <Table.Tr key={fieldSchema.name}>
      <Table.Td>{nameColumn}</Table.Td>
      <Table.Td>{isRequiredColumn}</Table.Td>
      <Table.Td>{dataTypeColumn}</Table.Td>
      <Table.Td>{isCaseSensitiveColumn}</Table.Td>
      <Table.Td>{allowEmptyValuesColumn}</Table.Td>
      <Table.Td>{allowedValuesColumn}</Table.Td>

      <Table.Td>
        <ActionIcon
          variant="transparent"
          color="dark"
          size="sm"
          onClick={() => {
            if (isEditModeOn) {
              editModeActions.close();

              // update the field schema
              const dataType = dataTypeField.getValue();
              const newFieldSchema = {
                ...fieldSchema,
                name: nameField.getValue(),
                required: isRequiredField.getValue(),
                dataTypeValidation:
                  dataType === 'timestamp'
                    ? {
                        dataType,
                        dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
                      }
                    : { dataType },
                caseSensitive: isCaseSensitiveField.getValue(),
                allowEmptyValues: allowEmptyValuesField.getValue(),
              };

              onFieldSchemaChange(fieldIndex, newFieldSchema);
            } else {
              editModeActions.open();
            }
          }}
        >
          {isEditModeOn ? <IconCheck /> : <IconEdit />}
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
