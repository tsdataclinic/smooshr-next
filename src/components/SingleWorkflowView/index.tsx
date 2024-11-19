import { Button, Group, Loader, Modal, Text, Tooltip } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
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
import { TitleInput } from './Workspace/TitleInput';

export function SingleWorkflowView(): JSX.Element | null {
  const queryClient = useQueryClient();
  const params = useParams<{ workflowId: string }>();

  const { data: workflow, isLoading } = useQuery({
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

  const updateWorkflowInCache = React.useCallback(
    (worfklowId: string, newWorkflow: FullWorkflow | undefined) => {
      queryClient.setQueryData(
        WorkflowUtil.QUERY_KEYS.workflow(worfklowId),
        newWorkflow,
      );
    },
    [queryClient],
  );

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

    onMutate: async (newWorkflow: FullWorkflow) => {
      // cancel any outgoing refetches so they don't overwrite our optimistic
      // update
      await queryClient.cancelQueries({
        queryKey: WorkflowUtil.QUERY_KEYS.workflow(newWorkflow.id),
      });

      // Snapshot the previous value
      const previousWorkflow = workflow;

      // Optimistically update the workflow
      updateWorkflowInCache(newWorkflow.id, newWorkflow);

      // return a context with the previous and new workflow
      return { previousWorkflow, newWorkflow };
    },

    // If the mutation fails, roll back the workflow
    onError: (_error, newWorkflow, context) => {
      updateWorkflowInCache(newWorkflow.id, context?.previousWorkflow);
    },

    onSettled: (newWorkflow: FullWorkflow | undefined) => {
      if (newWorkflow) {
        queryClient.invalidateQueries({
          queryKey: WorkflowUtil.QUERY_KEYS.workflow(newWorkflow.id),
        });
      }
    },
  });

  const sendSaveWorkflowRequest = useDebouncedCallback(
    (workflowToSave: FullWorkflow) => {
      saveWorkflowMutation.mutate(workflowToSave, {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Saved',
            message: 'Updated workflow',
          });
        },
      });
    },
    3000,
  );

  const [isTestWorkflowModalOpen, testWorkflowModalActions] =
    useDisclosure(false);

  const onWorkflowChange = React.useCallback(
    (workflowToSave: FullWorkflow) => {
      // Optimistically update the workflow
      updateWorkflowInCache(workflowToSave.id, workflowToSave);

      // Update workflow in the backend
      sendSaveWorkflowRequest(workflowToSave);
    },
    [sendSaveWorkflowRequest, updateWorkflowInCache],
  );

  const onWorkflowSchemaChange = React.useCallback(
    (workflowSchema: WorkflowSchema_Output) => {
      if (workflow) {
        onWorkflowChange({ ...workflow, schema: workflowSchema });
      }
    },
    [workflow, onWorkflowChange],
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && workflow) {
    return (
      <>
        {/* Header row */}
        <Group mb="lg">
          <TitleInput
            defaultTitle={workflow.title}
            onTitleSave={(newTitle: string) => {
              onWorkflowChange({
                ...workflow,
                title: newTitle,
              });
            }}
          />
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

  return <Text c="red">There was an error loading the workflow.</Text>;
}
