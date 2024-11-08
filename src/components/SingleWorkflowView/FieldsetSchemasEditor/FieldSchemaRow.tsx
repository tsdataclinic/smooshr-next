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
import { ParamReference } from '../../../client';
import { useDisclosure, useFocusTrap } from '@mantine/hooks';
import { useWorkflowModelContext } from '../WorkflowModelContext';

type Props = {
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

  return allowedValues.paramId;
}

export function FieldSchemaRow({ fieldsetIndex, index }: Props): JSX.Element {
  const fieldSchemaPath = `schema.fieldsetSchemas.${fieldsetIndex}.fields.${index}`;
  const workflowModel = useWorkflowModelContext();
  const focusTrapRef = useFocusTrap();
  const [isEditModeOn, editModeActions] = useDisclosure(false);
  const fieldSchema =
    workflowModel.getValues().schema.fieldsetSchemas[fieldsetIndex].fields[
      index
    ];

  const nameColumn = isEditModeOn ? (
    <TextInput
      key={workflowModel.key(`${fieldSchemaPath}.name`)}
      {...workflowModel.getInputProps(`${fieldSchemaPath}.name`)}
    />
  ) : (
    <Text size="sm">{fieldSchema.name}</Text>
  );

  const isRequiredColumn = isEditModeOn ? (
    <Checkbox
      key={workflowModel.key(`${fieldSchemaPath}.required`)}
      {...workflowModel.getInputProps(`${fieldSchemaPath}.required`, {
        type: 'checkbox',
      })}
    />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.required)}</Text>
  );

  const dataTypeColumn = isEditModeOn ? (
    <Select
      key={workflowModel.key(`${fieldSchemaPath}.dataTypeValidation.dataType`)}
      data={DATA_TYPE_OPTIONS}
      {...workflowModel.getInputProps(
        `${fieldSchemaPath}.dataTypeValidation.dataType`,
      )}
    />
  ) : (
    <Text tt="capitalize" size="sm">
      {fieldSchema.dataTypeValidation.dataType}
    </Text>
  );

  const isCaseSensitiveColumn = isEditModeOn ? (
    <Checkbox
      key={workflowModel.key(`${fieldSchemaPath}.caseSensitive`)}
      {...workflowModel.getInputProps(`${fieldSchemaPath}.caseSensitive`, {
        type: 'checkbox',
      })}
    />
  ) : (
    <Text size="sm">{booleanToString(fieldSchema.caseSensitive)}</Text>
  );

  const allowEmptyValuesColumn = isEditModeOn ? (
    <Checkbox
      key={workflowModel.key(`${fieldSchemaPath}.allowEmptyValues`)}
      {...workflowModel.getInputProps(`${fieldSchemaPath}.allowEmptyValues`, {
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
