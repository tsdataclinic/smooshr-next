import { WorkflowParam } from '../../../client';
import { NumberInput, Text, TextInput } from '@mantine/core';
import { match } from 'ts-pattern';
import { UseFormReturnType } from '@mantine/form';
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
          />
        ))
        .with('string', () => (
          <TextInput
            key={inputKey}
            {...inputProps}
            required={param.required}
            label={param.displayName}
          />
        ))
        .with('string list', () => {
          return (
            <>
              <Text>{param.displayName}</Text>
              <Text color="red">String list params are not supported yet.</Text>
            </>
          );
        })
        .exhaustive()}
    </div>
  );
}
