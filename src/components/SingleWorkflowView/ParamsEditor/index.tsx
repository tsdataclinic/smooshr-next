import { WorkflowParam } from '../../../client';
import { IconTrash } from '@tabler/icons-react';
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
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { WorkflowUtil } from '../../../util/WorkflowUtil';
import { modals } from '@mantine/modals';
import { useWorkflowModelContext } from '../WorkflowModelContext';
import { toVariableIdentifierName } from '../../../util/stringUtil';

function makeEmptyWorkflowParam(index: number): WorkflowParam {
  const displayName = `Input ${index}`;
  return {
    id: uuid(),
    displayName,
    name: toVariableIdentifierName(displayName),
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

export function ParamsEditor(): JSX.Element {
  const workflowModel = useWorkflowModelContext();

  const openDeleteModal = (inputIdx: number) => {
    modals.openConfirmModal({
      title: 'Delete input',
      children: (
        <Text size="sm">Are you sure you want to delete this input?</Text>
      ),
      labels: { confirm: 'Delete input', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        const newWorkflow = WorkflowUtil.removeParamByIndex(
          workflowModel.getValues(),
          inputIdx,
        );
        workflowInputsForm.removeListItem('params', inputIdx);
        workflowModel.setValues(newWorkflow);
      },
    });
  };

  // NOTE: we *cannot* use workflowModel directly because we need this sub-form,
  // because we we have to apply a transformation on value change to update
  // the param name with a transformed form of the display name
  const workflowInputsForm = useForm<{ params: WorkflowParam[] }>({
    mode: 'uncontrolled',
    initialValues: {
      params: workflowModel.getValues().schema.params,
    },
    onValuesChange: (newParams: { params: WorkflowParam[] }) => {
      const transformedParams = newParams.params.map((param) => {
        return {
          ...param,
          name: toVariableIdentifierName(param.displayName),
        };
      });

      const workflowToSave = WorkflowUtil.updateWorkflowParams(
        workflowModel.getValues(),
        transformedParams,
      );
      workflowModel.setValues(workflowToSave);
    },
  });

  const { params } = workflowInputsForm.getValues();

  return (
    <form>
      <Stack>
        {params.length === 0 ? (
          <Text>No workflow inputs have been configured yet</Text>
        ) : (
          <>
            <Button
              variant="outline"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                workflowInputsForm.insertListItem(
                  'params',
                  makeEmptyWorkflowParam(params.length + 1),
                );
              }}
            >
              Add new input
            </Button>
            {params.map((param, i) => {
              return (
                <Fieldset
                  key={param.id}
                  className="relative"
                  legend={<Text>{param.displayName}</Text>}
                >
                  <ActionIcon
                    aria-label="Delete input"
                    variant="transparent"
                    className="absolute -top-1 right-1"
                    color="dark"
                    size="sm"
                  >
                    <IconTrash onClick={() => openDeleteModal(i)} />
                  </ActionIcon>

                  <Group>
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
            })}
          </>
        )}
      </Stack>
    </form>
  );
}
