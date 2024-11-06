import { useUncontrolled } from '@mantine/hooks';
import { ComboboxItem, Select } from '@mantine/core';
import {
  FieldsetSchema_Output,
  ParamReference,
  WorkflowParam,
} from '../../../../client';
import { UncontrolledInputProps } from '../../../../util/types';
import { WorkflowUtil } from '../../../../util/WorkflowUtil';

type Props = UncontrolledInputProps<string | ParamReference> & {
  fieldsetSchemas: readonly FieldsetSchema_Output[];
  workflowParams: readonly WorkflowParam[];
};

/**
 * A FieldsetSchema selector that supports either selecting a fieldset
 * by name or by selecting a param reference. If a param reference is
 * selected, we handle converting it from a param reference string
 * to a param reference object.
 */
export function FieldsetSchemaSelect({
  workflowParams,
  fieldsetSchemas,
  ...inputProps
}: Props): JSX.Element {
  const [value, onSelectChange] = useUncontrolled(inputProps);

  const fieldsetSchemaOptions: ComboboxItem[] = fieldsetSchemas.map(
    (fieldSchema: FieldsetSchema_Output) => {
      return { value: fieldSchema.id, label: fieldSchema.name };
    },
  );

  const workflowStringParamOptions: ComboboxItem[] = workflowParams
    .filter((param) => param.type === 'string')
    .map((param: WorkflowParam) => {
      return {
        value: WorkflowUtil.WorkflowParam.toReferenceString(param),
        label: param.name,
      };
    });

  const fieldsetComboboxData = [
    {
      group: 'Column schemas',
      items: fieldsetSchemaOptions,
    },
    {
      group: 'Workflow inputs',
      items: workflowStringParamOptions,
    },
  ];

  return (
    <Select
      value={
        typeof value === 'string'
          ? value
          : WorkflowUtil.ParamReference.toReferenceString(value)
      }
      required
      label="Column Schema"
      data={fieldsetComboboxData}
      placeholder="Select a column ruleset to use"
      onChange={(fieldset: string | null) => {
        if (fieldset === null) {
          onSelectChange('');
        } else {
          onSelectChange(
            WorkflowUtil.ParamReference.isReferenceString(fieldset)
              ? WorkflowUtil.ParamReference.fromReferenceString(fieldset)
              : fieldset,
          );
        }
      }}
    />
  );
}
