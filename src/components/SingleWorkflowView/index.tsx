import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { processAPIData } from '../../util/apiUtil';
import { WorkflowsService } from '../../client';
import {
  Loader,
  Title,
  Group,
  Button,
  ActionIcon,
  Affix,
  Menu,
} from '@mantine/core';
import { IconDots, IconPlus } from '@tabler/icons-react';

export function SingleWorkflowView(): JSX.Element {
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

  return (
    <>
      {isLoading ? <Loader /> : null}
      {!isLoading && workflow ? (
        <>
          <Group>
            <Title order={1}>{workflow?.title}</Title>
            <Menu withArrow shadow="md" width={200}>
              <Menu.Target>
                <Button unstyled>
                  <IconDots />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item disabled>Add reference schemas</Menu.Item>
                <Menu.Item disabled>Edit inputs</Menu.Item>
                <Menu.Item disabled>Publish workflow</Menu.Item>
                <Menu.Item disabled>Test workflow</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <p>This page is still a work in progress.</p>
          <Affix position={{ bottom: 40, right: 40 }}>
            <ActionIcon color="blue" radius="xl" size={60}>
              <Menu withArrow shadow="md" width={150} position="left">
                <Menu.Target>
                  <IconPlus stroke={1.5} size={30} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu
                    width={250}
                    shadow="md"
                    position="left"
                    trigger="hover"
                    openDelay={100}
                    closeDelay={200}
                  >
                    <Menu.Target>
                      <Menu.Item>Data Validation</Menu.Item>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item>Has column headers</Menu.Item>
                      <Menu.Item disabled>Are column values equal to</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>

                  <Menu.Item disabled>Flow Control</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </ActionIcon>
          </Affix>
        </>
      ) : null}
    </>
  );
}
