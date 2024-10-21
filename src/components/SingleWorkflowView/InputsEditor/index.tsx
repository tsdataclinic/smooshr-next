import { FullWorkflow, WorkflowParam } from '../../../client';
import { v4 as uuid } from 'uuid';
import {
  Group,
  Button,
  Fieldset,
  Checkbox,
  ComboboxItem,
  Select,
  Text,
  TextInput,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';

type Props = {
  workflow: FullWorkflow;
};

function makeEmptyWorkflowParam(index: number): WorkflowParam {
  const name = `Input ${index}`;
  return {
    id: uuid(),
    name,
    displayName: name,
    description: '',
    required: true,
    type: 'string',
  };
}

const PARAM_TYPE_OPTIONS: ComboboxItem[] = [
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
];

export function InputsEditor({ workflow }: Props): JSX.Element {
  // TODO: remove this line
  console.log('workflow schema', workflow.schema);

  const workflowInputsForm = useForm<{ params: WorkflowParam[] }>({
    mode: 'controlled',
    initialValues: {
      params: workflow.schema.params,
    },
  });

  const { params } = workflowInputsForm.getValues();

  console.log('params from form', params);

  return (
    <form
      onSubmit={workflowInputsForm.onSubmit((paramsToSubmit) => {
        console.log('params to submit', paramsToSubmit);
      })}
    >
      <Stack>
        {params.length === 0 ? (
          <Text>No workflow inputs have been configured yet</Text>
        ) : (
          params.map((param, i) => {
            return (
              <Fieldset key={param.id} legend={<Text>{param.name}</Text>}>
                <Group>
                  <TextInput
                    key={workflowInputsForm.key(`params.${i}.name`)}
                    {...workflowInputsForm.getInputProps(`params.${i}.name`)}
                    label="Name"
                  />
                  <TextInput
                    key={workflowInputsForm.key(`params.${i}.displayName`)}
                    {...workflowInputsForm.getInputProps(
                      `params.${i}.displayName`,
                    )}
                    label="Display name"
                  />
                  <Select
                    key={workflowInputsForm.key(`params.${i}.type`)}
                    {...workflowInputsForm.getInputProps(`params.${i}.type`)}
                    data={PARAM_TYPE_OPTIONS}
                    label="Type"
                  />
                  <Checkbox
                    key={workflowInputsForm.key(`params.${i}.required`)}
                    {...workflowInputsForm.getInputProps(
                      `params.${i}.required`,
                      {
                        type: 'checkbox',
                      },
                    )}
                    label="Required"
                  />
                </Group>
                <Group align="center">
                  <TextInput
                    key={workflowInputsForm.key(`params.${i}.description`)}
                    {...workflowInputsForm.getInputProps(
                      `params.${i}.description`,
                    )}
                    label="Description"
                    className="w-full"
                  />
                </Group>
              </Fieldset>
            );
          })
        )}
        <Button
          variant="outline"
          type="submit"
          onClick={() => {
            workflowInputsForm.insertListItem(
              'params',
              makeEmptyWorkflowParam(params.length + 1),
            );
          }}
        >
          Add new input
        </Button>
      </Stack>
    </form>
  );
}
