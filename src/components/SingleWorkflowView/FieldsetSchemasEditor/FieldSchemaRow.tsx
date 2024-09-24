import pluralize from 'pluralize';
import { ActionIcon, Text, Table, TextInput } from '@mantine/core';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { ParamReference, FieldSchema } from '../../../client';
import { useDisclosure, useFocusTrap } from '@mantine/hooks';
import { useFieldsetSchemasFormContext } from './FieldsetSchemasContext';

type Props = {
  fieldSchema: FieldSchema;
  fieldsetIndex: number;
  index: number;
};

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

  return (
    <Table.Tr key={fieldSchema.name} ref={focusTrapRef}>
      <Table.Td>
        {isEditModeOn ? (
          <TextInput
            key={form.key(
              `fieldsetSchemas.${fieldsetIndex}.fields.${index}.name`,
            )}
            {...form.getInputProps(
              `fieldsetSchemas.${fieldsetIndex}.fields.${index}.name`,
            )}
          />
        ) : (
          <Text size="sm">{fieldSchema.name}</Text>
        )}
      </Table.Td>

      <Table.Td>
        <Text size="sm">{booleanToString(fieldSchema.required)}</Text>
      </Table.Td>

      <Table.Td>
        <Text tt="capitalize" size="sm">
          {fieldSchema.dataTypeValidation.dataType}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm">{booleanToString(fieldSchema.caseSensitive)}</Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm">{booleanToString(fieldSchema.allowEmptyValues)}</Text>
      </Table.Td>

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
