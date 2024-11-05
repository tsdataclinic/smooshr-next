import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { processAPIData } from '../../util/apiUtil';
import { FullWorkflow, WorkflowsService } from '../../client';
import { Loader, Title, Group, Button, Menu, Modal } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { TestWorkflowBlock } from './TestWorkflowBlock';
import { Workspace } from './Workspace';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

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

/**
 * We create a separate workflow view for when the workflow has loaded so that
 * we can use `useForm` without its value potentially being `undefined`.
 */
function LoadedWorkflowView({
  defaultWorkflow,
}: {
  defaultWorkflow: FullWorkflow;
}): JSX.Element {
  const queryClient = useQueryClient();
  const params = useParams<{ workflowId: string }>();

  // initialize our workflow form model using the server workflow
  const workflowModel = useForm({
    mode: 'uncontrolled',
    initialValues: defaultWorkflow,
  });

  const workflow = workflowModel.getValues();
  console.log('current workflow', workflow);

  const [isTestWorkflowModalOpen, testWorkflowModalActions] =
    useDisclosure(false);

  const saveWorkflowMutation = useMutation({
    mutationFn: async (updatedWorkflow: FullWorkflow) => {
      return processAPIData(
        WorkflowsService.updateWorkflow({
          path: {
            workflow_id: updatedWorkflow.id,
          },
          body: updatedWorkflow,
        }),
      );
    },

    onSuccess: () => {
      // load the workflow again
      queryClient.invalidateQueries({
        queryKey: WorkflowUtil.QUERY_KEYS.workflow(params.workflowId),
      });
    },
  });

  return (
    <>
      {/* Header row */}
      <Group mb="lg">
        <Title order={1}>{workflow.title}</Title>
        <Menu withArrow shadow="md" width={200}>
          <Menu.Target>
            <Button unstyled>
              <IconDots />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                saveWorkflowMutation.mutate(workflow);
                notifications.show({
                  title: 'Saved',
                  message: 'Updated workflow',
                });
              }}
            >
              Save workflow
            </Menu.Item>
            <Menu.Item disabled>Edit workflow</Menu.Item>
            <Menu.Item disabled>Publish workflow</Menu.Item>
            <Menu.Item onClick={testWorkflowModalActions.open}>
              Test workflow
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Main content */}
      <Workspace workflow={workflow} workflowModel={workflowModel} />

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
