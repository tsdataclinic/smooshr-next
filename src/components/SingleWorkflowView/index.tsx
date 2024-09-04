import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { processAPIData } from '../../util/apiUtil';
import { WorkflowsService } from '../../client';
import { Loader, Title, Group, Button } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';

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
            <Button
              unstyled
              onClick={() => {
                console.log('clicked menu');
              }}
            >
              <IconDots />
            </Button>
          </Group>

          <p>This page is still a work in progress.</p>
        </>
      ) : null}
    </>
  );
}
