import { Button, Group, Loader, Modal, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useParams } from 'wouter';
import {
  FullWorkflow,
  WorkflowSchema_Output,
  WorkflowsService,
} from '../../client';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { processAPIData } from '../../util/apiUtil';
import { TestWorkflowBlock } from './TestWorkflowBlock';
import { Workspace } from './Workspace';

export function SingleWorkflowView(): JSX.Element | null {
  const params = useParams<{ workflowId: string }>();
  const { data: workflowFromServer, isLoading } = useQuery({
    queryKey: WorkflowUtil.QUERY_KEYS.workflow(params.workflowId),
    queryFn: () => {
      return processAPIData(
        WorkflowsService.getWorkflow({
          path: {
            workflow_id: params.workflowId,
          },
        }),
      );
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && workflowFromServer) {
    return <LoadedWorkflowView defaultWorkflow={workflowFromServer} />;
  }

  return null;
}

function LoadedWorkflowView({
  defaultWorkflow,
}: {
  defaultWorkflow: FullWorkflow;
}): JSX.Element {
  const queryClient = useQueryClient();
  const urlParams = useParams<{ workflowId: string }>();
  const [workflow, setWorkflow] = React.useState<FullWorkflow>(defaultWorkflow);
  const [isTestWorkflowModalOpen, testWorkflowModalActions] =
    useDisclosure(false);

  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflowToSave: FullWorkflow) => {
      return processAPIData(
        WorkflowsService.updateWorkflow({
          path: {
            workflow_id: workflowToSave.id,
          },
          body: workflowToSave,
        }),
      );
    },

    onSuccess: () => {
      // load the workflow again
      queryClient.invalidateQueries({
        queryKey: WorkflowUtil.QUERY_KEYS.workflow(urlParams.workflowId),
      });
    },
  });

  const onWorkflowSchemaChange = React.useCallback(
    (workflowSchema: WorkflowSchema_Output) => {
      setWorkflow((prevWorkflow) => {
        return {
          ...prevWorkflow,
          schema: workflowSchema,
        };
      });
    },
    [setWorkflow],
  );

  return (
    <>
      {/* Header row */}
      <Group mb="lg">
        <Title order={1}>{workflow.title}</Title>
        <Button
          onClick={() => {
            saveWorkflowMutation.mutate(workflow, {
              onSuccess: () => {
                notifications.show({
                  color: 'green',
                  title: 'Saved',
                  message: 'Updated workflow',
                });
              },
            });
          }}
        >
          Save workflow
        </Button>
        <Tooltip label="Not implemented yet" position="bottom" withArrow>
          <Button disabled>Edit title</Button>
        </Tooltip>
        <Tooltip label="Not implemented yet" position="bottom" withArrow>
          <Button disabled>Publish workflow</Button>
        </Tooltip>
        <Button onClick={testWorkflowModalActions.open}>Test workflow</Button>
      </Group>

      {/* Main content */}
      <Workspace
        workflowSchema={workflow.schema}
        onWorkflowSchemaChange={onWorkflowSchemaChange}
      />

      <Modal
        opened={isTestWorkflowModalOpen}
        onClose={testWorkflowModalActions.close}
        title="Test workflow"
        size="auto"
      >
        <TestWorkflowBlock workflow={workflow} />
      </Modal>
    </>
  );
}
