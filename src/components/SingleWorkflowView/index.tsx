import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { processAPIData } from '../../util/apiUtil';
import { WorkflowsService } from '../../client';
import { Loader } from '@mantine/core';

export function SingleWorkflowView(): JSX.Element {
  const params = useParams<{ workflowId: string }>();
  const { data: workflow, isLoading } = useQuery({
    queryKey: WorkflowUtil.QUERY_KEYS.workflow(params.workflowId),
    queryFn: () =>
      processAPIData(
        WorkflowsService.getWorkflow({
          path: {
            workflow_id: params.workflowId,
          },
        }),
      ),
  });

  return (
    <>
      {isLoading ? <Loader /> : null}
      {!isLoading && workflow ? (
        <div>
          <p>{workflow?.title}</p>
          <p>This page is still a work in progress.</p>
        </div>
      ) : null}
    </>
  );
}
