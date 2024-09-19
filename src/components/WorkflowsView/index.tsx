import { Text, Button, Divider, List, Modal, TextInput } from '@mantine/core';
import { WorkflowsService } from '../../client';
import { processAPIData } from '../../util/apiUtil';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import day from 'dayjs';
import { Link, useLocation } from 'wouter';

export function WorkflowsView(): JSX.Element {
  const [, navigate] = useLocation();
  const [isCreateModalOpened, createModalActions] = useDisclosure(false);
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: 'New workflow',
    },
  });

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
    mutationFn: (title: string) => {
      return processAPIData(
        WorkflowsService.createWorkflow({
          body: { title },
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WorkflowUtil.QUERY_KEYS.all });
    },
  });

  const onCreateClick = () => {
    createModalActions.open();
  };

  const renderWorkflows = () => {
    if (isLoading) {
      return 'Loading...';
    }

    if (isError || workflows === undefined) {
      return 'Error loading workflows';
    }

    return (
      <div className="space-y-4">
        <Button onClick={onCreateClick}>New Workflow</Button>
        {workflows.length === 0 ? (
          <Text>
            You currently have no workflows. Click on the button above to create
            one!
          </Text>
        ) : (
          <List size="lg" className="rounded border border-gray-200 text-left">
            {workflows.map((workflow, i) => (
              <List.Item
                classNames={{
                  itemWrapper: 'w-full',
                  itemLabel: 'w-full',
                }}
                key={workflow.id}
                className="w-full transition-colors hover:bg-gray-100"
              >
                <Link to={WorkflowUtil.getWorkflowURI(workflow.id)}>
                  <div className="flex w-full items-center p-3 hover:bg-gray-100">
                    <div className="border-r border-gray-400 pr-2">{i + 1}</div>
                    <div className="pl-2">{workflow.title}</div>
                    <div className="flex-1 pl-2 text-right text-sm">
                      Created{' '}
                      {day(workflow.created_date).format('MMM DD, YYYY')}
                    </div>
                  </div>
                </Link>
                {i !== workflows.length - 1 ? <Divider /> : null}
              </List.Item>
            ))}
          </List>
        )}
      </div>
    );
  };

  // TODO: add a loading spinner for loading state
  return (
    <div className="container mx-auto">
      {renderWorkflows()}
      <Modal
        opened={isCreateModalOpened}
        onClose={createModalActions.close}
        title="Create New Workflow"
      >
        <form
          onSubmit={form.onSubmit((values) => {
            createWorkflowMutation.mutate(values.title, {
              onSuccess: (newWorkflow) => {
                notifications.show({
                  title: 'Success',
                  message: 'Your new workflow is ready',
                });
                createModalActions.close();
                navigate(WorkflowUtil.getWorkflowURI(newWorkflow.id));
              },
              onError: () => {
                notifications.show({
                  title: 'Error',
                  message: 'There was an error creating the workflow',
                  color: 'red',
                });
              },
            });
          })}
        >
          <TextInput
            key={form.key('title')}
            required
            label="Workflow Title"
            {...form.getInputProps('title')}
          />
          <div className="mt-4 space-x-2 text-right">
            <Button variant="outline" onClick={createModalActions.close}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
