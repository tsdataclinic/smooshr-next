import {
  SegmentedControl,
  Select,
  Stack,
  TagsInput,
  Text,
} from '@mantine/core';
import * as React from 'react';
import { ParamReference, WorkflowParam } from '../../../client';

export type AllowedValues = string[] | ParamReference | null;

type Props = {
  defaultAllowedValues: AllowedValues;
  workflowParams: WorkflowParam[];
};

export type AllowedValuesModalContentRef = {
  getAllowedValues(): AllowedValues;
};

function isParamReference(
  allowedValues: unknown,
): allowedValues is ParamReference {
  return (
    typeof allowedValues === 'object' &&
    allowedValues !== null &&
    'paramId' in allowedValues
  );
}

export const AllowedValuesModalContent = React.forwardRef(function (
  { defaultAllowedValues, workflowParams }: Props,
  ref: React.ForwardedRef<AllowedValuesModalContentRef>,
): JSX.Element {
  const [allowedValues, setAllowedValues] =
    React.useState<AllowedValues>(defaultAllowedValues);

  const [pickerMode, setPickerMode] = React.useState<
    'workflow-params' | 'value-list'
  >(!Array.isArray(defaultAllowedValues) ? 'workflow-params' : 'value-list');

  React.useImperativeHandle(
    ref,
    () => {
      return {
        getAllowedValues: () => {
          return allowedValues;
        },
      };
    },
    [allowedValues],
  );

  // Filter to only string list params as they're the only valid type for allowed values
  const paramOptions = workflowParams
    .filter((param) => param.type === 'string list')
    .map((param) => ({
      value: param.id,
      label: param.displayName,
    }));

  const onPickerModeChange = (value: string) => {
    setPickerMode(value as 'workflow-params' | 'value-list');
    setAllowedValues(value === 'value-list' ? [] : null);
  };

  const renderWorkflowParamsPicker = () => {
    if (isParamReference(allowedValues) || allowedValues === null) {
      if (paramOptions.length === 0) {
        return (
          <Text size="sm">There are no workflow inputs of type Text List.</Text>
        );
      }

      return (
        <Select
          value={allowedValues?.paramId}
          allowDeselect={false}
          label="Select a parameter"
          placeholder="Select a parameter"
          data={paramOptions}
          onChange={(value) => {
            if (value) {
              setAllowedValues({ paramId: value });
            }
          }}
        />
      );
    }
    return null;
  };

  const renderValueListPicker = () => {
    if (Array.isArray(allowedValues)) {
      return (
        <TagsInput
          value={allowedValues}
          label="Press Enter to add a value"
          placeholder="Enter values"
          onChange={setAllowedValues}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        />
      );
    }
    return null;
  };

  return (
    <Stack>
      <SegmentedControl
        fullWidth
        data={[
          { label: 'Manually enter values', value: 'value-list' },
          { label: 'Use workflow input', value: 'workflow-params' },
        ]}
        value={pickerMode}
        onChange={onPickerModeChange}
      />
      {pickerMode === 'workflow-params' ? renderWorkflowParamsPicker() : null}
      {pickerMode === 'value-list' ? renderValueListPicker() : null}
    </Stack>
  );
});

AllowedValuesModalContent.displayName = 'AllowedValuesModalContent';
