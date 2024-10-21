import { WorkflowsService, FullWorkflow, WorkflowParam } from '../../../client';
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
import { useMutation } from '@tanstack/react-query';
import { WorkflowUtil } from '../../../util/WorkflowUtil';
import { processAPIData } from '../../../util/apiUtil';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

type Props = {
  workflow: FullWorkflow;
};

/**
 * Convert a display string to a valid identifier name for a variable.
 */
function toVariableIdentifierName(displayName: string): string {
  return (
    displayName
      .trim()
      // Remove all non-alphanumeric characters except spaces
      .replace(/[^\w\s]/g, '')
      // Replace spaces to underscores
      .replace(/\s+/g, '_')
      // make first character lower case
      .replace(/^[A-Z]/, (match) => match.toLowerCase())
  );
}

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

export function ParamsEditor({ workflow }: Props): JSX.Element {
  const openDeleteModal = (inputIdx: number) => {
    modals.openConfirmModal({
      title: 'Delete input',
      children: (
        <Text size="sm">Are you sure you want to delete this input?</Text>
      ),
      labels: { confirm: 'Delete input', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        workflowInputsForm.removeListItem('params', inputIdx);
      },
    });
  };

  const workflowInputsForm = useForm<{ params: WorkflowParam[] }>({
    mode: 'controlled',
    initialValues: {
      params: workflow.schema.params,
    },
    transformValues: (values) => {
      return {
        params: values.params.map((param) => {
          return {
            ...param,
            name: toVariableIdentifierName(param.displayName),
          };
        }),
      };
    },
  });

  const saveInputsMutation = useMutation({
    mutationFn: async (workflowParams: readonly WorkflowParam[]) => {
      const workflowToSave = WorkflowUtil.updateWorkflowParams(
        workflow,
        workflowParams,
      );
      const savedWorkflow = await processAPIData(
        WorkflowsService.updateWorkflow({
          path: {
            workflow_id: workflowToSave.id,
          },
          body: workflowToSave,
        }),
      );
      return savedWorkflow;
    },
  });

  const { params } = workflowInputsForm.getValues();

  return (
    <form
      onSubmit={workflowInputsForm.onSubmit((paramsToSubmit) => {
        saveInputsMutation.mutate(paramsToSubmit.params, {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Inputs saved successfully',
              color: 'green',
            });
          },
        });
      })}
    >
      <Stack>
        {params.length === 0 ? (
          <Text>No workflow inputs have been configured yet</Text>
        ) : (
          <>
            <Button type="submit">Save</Button>
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
        <Button
          variant="outline"
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
