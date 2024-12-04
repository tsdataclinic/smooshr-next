import { NumberInput, TagsInput, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { match } from 'ts-pattern';
import { WorkflowParam } from '../../../client';
import { WorkflowParamValues } from './types';

type Props = {
  param: WorkflowParam;
  paramsForm: UseFormReturnType<{
    workflowParamValues: WorkflowParamValues;
  }>;
};

export function ParamFormInput({ param, paramsForm }: Props): JSX.Element {
  const inputKey = paramsForm.key(`workflowParamValues.${param.name}`);
  const inputProps = paramsForm.getInputProps(
    `workflowParamValues.${param.name}`,
  );

  return (
    <div key={param.id}>
      {match(param.type)
        .with('number', () => (
          <NumberInput
            key={inputKey}
            {...inputProps}
            required={param.required}
            label={param.displayName}
            description={param.description}
          />
        ))
        .with('string', () => (
          <TextInput
            key={inputKey}
            {...inputProps}
            required={param.required}
            label={param.displayName}
            description={param.description}
          />
        ))
        .with('string list', () => {
          return (
            <>
              <TagsInput
                key={inputKey}
                {...inputProps}
                required={param.required}
                label={param.displayName}
                description={param.description}
                placeholder="Press Enter to add a value"
              />
            </>
          );
        })
        .exhaustive()}
    </div>
  );
}
