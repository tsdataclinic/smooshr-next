import { Button } from '@mantine/core';
import { WorkflowsService } from '../../client';
import { Layout } from '../Layout';
import { processAPIData } from '../../util/apiUtil';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkflowUtil } from '../../util/WorkflowUtil';

export function WorkflowsView(): JSX.Element {
  const {
    data: workflows,
    isLoading,
    isError,
  } = useQuery({
    queryKey: WorkflowUtil.QUERY_KEYS.all,
    queryFn: () => processAPIData(WorkflowsService.getWorkflows()),
  });

  const queryClient = useQueryClient();

  const createWorkflowMutation = useMutation({
    mutationFn: () => {
      return processAPIData(
        WorkflowsService.createWorkflow({
          body: {
            title: 'test workflow',
          },
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WorkflowUtil.QUERY_KEYS.all });
    },
  });

  const onCreateClick = async () => {
    createWorkflowMutation.mutate(undefined, {
      onSuccess: (newWorkflow) => {
        console.log('new workflow', newWorkflow);
      },
    });
  };

  const renderWorkflows = () => {
    if (isLoading) {
      return 'Loading...';
    }

    if (isError || workflows === undefined) {
      return 'Error loading workflows';
    }

    if (workflows.length === 0) {
      return <Button onClick={onCreateClick}>Create</Button>;
    }

    return workflows.map((workflow, i) => (
      <p key={workflow.id}>
        {i + 1}. {workflow.title} | {workflow.created_date}
      </p>
    ));
  };

  // TODO: add a loading spinner for loading state
  return <Layout>{renderWorkflows()}</Layout>;
}
