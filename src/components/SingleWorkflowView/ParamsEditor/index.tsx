import * as React from 'react';
import { WorkflowParam } from '../../../client';
import { v4 as uuid } from 'uuid';
import { Button, Text, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { toVariableIdentifierName } from '../../../util/stringUtil';
import { WorkflowParamBlock } from './WorkflowParamBlock';

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

type Props = {
  workflowParams: WorkflowParam[];
  onWorkflowParamsChange: (params: WorkflowParam[]) => void;
};

export function ParamsEditor({
  workflowParams,
  onWorkflowParamsChange,
}: Props): JSX.Element {
  const openDeleteModal = (inputIdx: number) => {
    modals.openConfirmModal({
      title: 'Delete input',
      children: (
        <Text size="sm">Are you sure you want to delete this input?</Text>
      ),
      labels: { confirm: 'Delete input', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onWorkflowParamsChange(
          workflowParams.filter((_, i) => {
            return i !== inputIdx;
          }),
        );
      },
    });
  };

  const onWorkflowParamChange = React.useCallback(
    (updatedParam: WorkflowParam) => {
      const newParams = workflowParams.map((p) => {
        return p.id === updatedParam.id ? updatedParam : p;
      });
      onWorkflowParamsChange(newParams);
    },
    [workflowParams, onWorkflowParamsChange],
  );

  return (
    <form>
      <Stack>
        {workflowParams.length === 0 ? (
          <Text>No workflow inputs have been configured yet</Text>
        ) : (
          <>
            <Button
              variant="outline"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                onWorkflowParamsChange([
                  ...workflowParams,
                  makeEmptyWorkflowParam(workflowParams.length + 1),
                ]);
              }}
            >
              Add new input
            </Button>
            {workflowParams.map((param, i) => {
              return (
                <WorkflowParamBlock
                  key={param.id}
                  workflowParam={param}
                  paramIndex={i}
                  onOpenDeleteModal={openDeleteModal}
                  onWorkflowParamChange={onWorkflowParamChange}
                />
              );
            })}
          </>
        )}
      </Stack>
    </form>
  );
}
