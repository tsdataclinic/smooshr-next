import {
  ActionIcon,
  Checkbox,
  ComboboxItem,
  Group,
  Select,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useField } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import pluralize from 'pluralize';
import * as React from 'react';
import { FieldSchema, ParamReference, WorkflowParam } from '../../../client';
import {
  AllowedValues,
  AllowedValuesModalContent,
  AllowedValuesModalContentRef,
} from './AllowedValuesModalContent';

type Props = {
  fieldIndex: number;
  fieldSchema: FieldSchema;
  onFieldSchemaChange: (index: number, fieldSchema: FieldSchema) => void;
  workflowParams: WorkflowParam[];
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
  workflowParams: WorkflowParam[],
): string {
  const EMPTY = '--';

  if (allowedValues === null || allowedValues === undefined) {
    return EMPTY;
  }

  if (Array.isArray(allowedValues)) {
    return allowedValues.length === 0
      ? EMPTY
      : pluralize('values', allowedValues.length, true);
  }

  const param = workflowParams.find((p) => p.id === allowedValues.paramId);
  if (param === undefined) {
    return 'ERROR: Param not found';
  }
  return param.displayName;
}

export function FieldSchemaRow({
  fieldSchema,
  fieldIndex,
  onFieldSchemaChange,
  workflowParams,
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

  const allowedValuesModalRef =
    React.useRef<AllowedValuesModalContentRef | null>(null);
  const [currentAllowedValues, setCurrentAllowedValues] =
    React.useState<AllowedValues>(fieldSchema.allowedValues);

  const openAllowedValuesModal = () => {
    modals.openConfirmModal({
      title: 'Allowed values',
      children: (
        <AllowedValuesModalContent
          ref={allowedValuesModalRef}
          defaultAllowedValues={currentAllowedValues}
          workflowParams={workflowParams}
        />
      ),
      labels: { confirm: 'Save', cancel: 'Cancel' },
      confirmProps: { color: 'blue' },
      onConfirm: () => {
        setCurrentAllowedValues(
          allowedValuesModalRef.current?.getAllowedValues() ?? null,
        );
      },
      onCancel: () => {
        setCurrentAllowedValues(fieldSchema.allowedValues);
      },
      onKeyDown: (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          modals.closeAll();
        }
      },
      trapFocus: true,
    });
  };

  const onSaveFieldSchema = () => {
    editModeActions.close();

    // update the field schema
    const dataType = dataTypeField.getValue();
    const newFieldSchema: FieldSchema = {
      ...fieldSchema,
      allowedValues: currentAllowedValues ?? null,
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

    console.log('new field schema', newFieldSchema);

    onFieldSchemaChange(fieldIndex, newFieldSchema);
  };

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
        {allowedValueListToString(currentAllowedValues, workflowParams)}
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
    <Text size="sm">
      {allowedValueListToString(fieldSchema.allowedValues, workflowParams)}
    </Text>
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
              onSaveFieldSchema();
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
