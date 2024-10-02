import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { processAPIData } from '../../util/apiUtil';
import { WorkflowsService } from '../../client';
import { Loader, Title, Group, Button, Menu, Modal } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { TestWorkflowBlock } from './TestWorkflowBlock';
import { Workspace } from './Workspace';

export function SingleWorkflowView(): JSX.Element | null {
  const params = useParams<{ workflowId: string }>();
  const { data: workflow, isLoading } = useQuery({
    queryKey: WorkflowUtil.QUERY_KEYS.workflow(params.workflowId),
    queryFn: () =>
      processAPIData(
        WorkflowsService.getWorkflow({
          path: {
            workflow_id: params.workflowId, // eslint-disable-line camelcase
          },
        }),
      ),
  });

  const [isTestWorkflowModalOpen, testWorkflowModalActions] =
    useDisclosure(false);

  console.log('Loaded workflow', workflow);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && workflow) {
    const headerRow = (
      <Group mb="lg">
        <Title order={1}>{workflow.title}</Title>
        <Menu withArrow shadow="md" width={200}>
          <Menu.Target>
            <Button unstyled>
              <IconDots />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item disabled>Edit workflow</Menu.Item>
            <Menu.Item disabled>Publish workflow</Menu.Item>
            <Menu.Item onClick={testWorkflowModalActions.open}>
              Test workflow
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    );

    return (
      <>
        {headerRow}
        <Workspace workflow={workflow} />

        <Modal
          opened={isTestWorkflowModalOpen}
          onClose={testWorkflowModalActions.close}
          title="Test workflow"
          size="auto"
        >
          <TestWorkflowBlock workflow={workflow} />;
        </Modal>
      </>
    );
  }

  return null;
}
