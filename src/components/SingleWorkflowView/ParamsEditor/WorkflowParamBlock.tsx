import * as R from 'remeda';
import * as React from 'react';
import { WorkflowParam } from '../../../client';
import {
  Fieldset,
  ActionIcon,
  Group,
  TextInput,
  Select,
  Checkbox,
  Text,
} from '@mantine/core';
import { useField } from '@mantine/form';

import { IconTrash } from '@tabler/icons-react';
import { toVariableIdentifierName } from '../../../util/stringUtil';

type Props = {
  workflowParam: WorkflowParam;
  onOpenDeleteModal: (index: number) => void;
  paramIndex: number;
  onWorkflowParamChange: (workflowParam: WorkflowParam) => void;
};

const PARAM_TYPE_OPTIONS = [
  {
    value: 'string',
    label: 'Text',
  },
  {
    value: 'number',
    label: 'Number',
  },
  {
    value: 'string list',
    label: 'Text list',
  },
] as const;

const PARAM_TYPE_VALUES = PARAM_TYPE_OPTIONS.map((option) => option.value);

export function WorkflowParamBlock({
  workflowParam,
  paramIndex,
  onOpenDeleteModal,
  onWorkflowParamChange,
}: Props): JSX.Element {
  const { displayName } = workflowParam;

  const displayNameField = useField({
    initialValue: workflowParam.displayName,
  });
  const typeField = useField({
    initialValue: workflowParam.type,
  });
  const requiredField = useField({
    initialValue: workflowParam.required,
    type: 'checkbox',
  });
  const descriptionField = useField({
    initialValue: workflowParam.description,
  });

  return (
    <Fieldset className="relative" legend={<Text>{displayName}</Text>}>
      <ActionIcon
        aria-label="Delete input"
        variant="transparent"
        className="absolute -top-1 right-1"
        color="dark"
        size="sm"
      >
        <IconTrash onClick={() => onOpenDeleteModal(paramIndex)} />
      </ActionIcon>

      <Group>
        <TextInput
          {...displayNameField.getInputProps()}
          label="Display name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { value: newDisplayName } = e.currentTarget;
            displayNameField.getInputProps().onChange(newDisplayName);
            onWorkflowParamChange({
              ...workflowParam,
              displayName: newDisplayName,
              name: toVariableIdentifierName(newDisplayName),
            });
          }}
        />
        <Select
          {...typeField.getInputProps()}
          data={PARAM_TYPE_OPTIONS}
          label="Type"
          onChange={(value) => {
            typeField.getInputProps().onChange(value);
            if (R.isIncludedIn(value, PARAM_TYPE_VALUES)) {
              onWorkflowParamChange({
                ...workflowParam,
                type: value,
              });
            }
          }}
        />
        <Checkbox
          {...requiredField.getInputProps()}
          label="Required"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { checked } = e.currentTarget;
            requiredField.getInputProps().onChange(checked);
            onWorkflowParamChange({
              ...workflowParam,
              required: checked,
            });
          }}
        />
      </Group>
      <Group align="center">
        <TextInput
          {...descriptionField.getInputProps()}
          label="Description"
          className="w-full"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.currentTarget;
            descriptionField.getInputProps().onChange(e.currentTarget.value);
            onWorkflowParamChange({
              ...workflowParam,
              description: value,
            });
          }}
        />
      </Group>
    </Fieldset>
  );
}
