import { WorkflowsService } from '../../client';
import { Layout } from '../Layout';
import { processAPIData } from '../../util/apiHelpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@mantine/core';
import { useCurrentUser } from '../../auth/useCurrentUser';

export function WorkflowsView(): JSX.Element {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => processAPIData(WorkflowsService.getWorkflows()),
  });

  const user = useCurrentUser();
  console.log('current user', user);

  const queryClient = useQueryClient();

  const createWorkflowMutation = useMutation({
    mutationFn: () => {
      console.log('calling create workflow mutation');
      return processAPIData(
        WorkflowsService.createWorkflow({
          body: {
            title: 'test workflow',
          },
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  console.log('workflows', workflows);

  const onCreateClick = async () => {
    createWorkflowMutation.mutate(undefined, {
      onSuccess: (newWorkflow) => {
        console.log('new workflow', newWorkflow);
      },
    });
  };

  return (
    <Layout>
      <p>
        <strong>Add create new workflow button here</strong>
      </p>
      List of all existing projects goes here
      {isLoading ? 'Loading...' : <p>{workflows?.length}</p>}
      {workflows?.length === 0 ? (
        <Button onClick={onCreateClick}>Create</Button>
      ) : null}
    </Layout>
  );
}
