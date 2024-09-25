import * as React from 'react';
import pluralize from 'pluralize';
import {
  ActionIcon,
  Text,
  Table,
  TextInput,
  Checkbox,
  Select,
  ComboboxItem,
} from '@mantine/core';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { ParamReference, FieldSchema } from '../../../client';
import {
  useDebouncedCallback,
  useDisclosure,
  useFocusTrap,
} from '@mantine/hooks';
import { useFieldsetSchemasFormContext } from './FieldsetSchemasContext';

type Props = {
  fieldSchema: FieldSchema;
  fieldsetIndex: number;
  index: number;
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

  return allowedValues.paramName;
}

export function FieldSchemaRow({
  fieldSchema,
  fieldsetIndex,
  index,
}: Props): JSX.Element {
  const focusTrapRef = useFocusTrap();
  const form = useFieldsetSchemasFormContext();
  const [isEditModeOn, editModeActions] = useDisclosure(false);
  const [colName, setColName] = React.useState(fieldSchema.name);

  const formKeyBase = `fieldsetSchemas.${fieldsetIndex}.fields.${index}`;

  const onNameChange = useDebouncedCallback((newColName) => {
    form.setFieldValue(`${formKeyBase}.name`, newColName);
  }, 200);

  const nameColumn = isEditModeOn ? (
    <TextInput
      key={form.key(`${formKeyBase}.name`)}
      {...form.getInputProps(`${formKeyBase}.name`)}
      value={colName}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const newColName = event.currentTarget.value;
        setColName(newColName);
        onNameChange(newColName);
      }}
    />
  ) : (
    <Text size="sm">{fieldSchema.name}</Text>
  );

  const isRequiredColumn = isEditModeOn ? (
    <Checkbox
      key={form.key(`${formKeyBase}.required`)}
      {...form.getInputProps(`${formKeyBase}.required`, { type: 'checkbox' })}
    />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.required)}</Text>
  );

  const dataTypeColumn = isEditModeOn ? (
    <Select
      key={form.key(`${formKeyBase}.dataTypeValidation.dataType`)}
      data={DATA_TYPE_OPTIONS}
      {...form.getInputProps(`${formKeyBase}.dataTypeValidation.dataType`)}
    />
  ) : (
    <Text tt="capitalize" size="sm">
      {fieldSchema.dataTypeValidation.dataType}
    </Text>
  );

  const isCaseSensitiveColumn = isEditModeOn ? (
    <Checkbox
      key={form.key(`${formKeyBase}.caseSensitive`)}
      {...form.getInputProps(`${formKeyBase}.caseSensitive`, {
        type: 'checkbox',
      })}
    />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.caseSensitive)}</Text>
  );

  const allowEmptyValuesColumn = isEditModeOn ? (
    <Checkbox
      key={form.key(`${formKeyBase}.allowEmptyValues`)}
      {...form.getInputProps(`${formKeyBase}.allowEmptyValues`, {
        type: 'checkbox',
      })}
    />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.allowEmptyValues)}</Text>
  );

  return (
    <Table.Tr key={fieldSchema.name} ref={focusTrapRef}>
      <Table.Td>{nameColumn}</Table.Td>
      <Table.Td>{isRequiredColumn}</Table.Td>
      <Table.Td>{dataTypeColumn}</Table.Td>
      <Table.Td>{isCaseSensitiveColumn}</Table.Td>
      <Table.Td>{allowEmptyValuesColumn}</Table.Td>

      <Table.Td>
        <Text size="sm">
          {allowedValueListToString(fieldSchema.allowedValues)}
        </Text>
      </Table.Td>

      <Table.Td>
        <ActionIcon
          variant="transparent"
          color="dark"
          size="sm"
          onClick={() => {
            if (isEditModeOn) {
              editModeActions.close();
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
