import { Button, Divider } from '@mantine/core';
import { WorkflowsService } from '../../client';
import { Layout } from '../Layout';
import { processAPIData } from '../../util/apiUtil';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkflowUtil } from '../../util/WorkflowUtil';
import { List, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import day from 'dayjs';

export function WorkflowsView(): JSX.Element {
  const [isCreateModalOpened, createModalActions] = useDisclosure(false);
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
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
        <List size="lg" className="text-left border border-gray-200 rounded">
          {workflows.map((workflow, i) => (
            <List.Item
              classNames={{
                itemWrapper: 'w-full',
                itemLabel: 'w-full',
              }}
              key={workflow.id}
              className="w-full px-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex w-full hover:bg-gray-100 py-3">
                <div className="pr-2 border-r border-gray-400">{i + 1}</div>
                <div className="pl-2">{workflow.title}</div>
                <div className="pl-2 flex-1 text-right text-sm">
                  Created {day(workflow.created_date).format('MMM DD, YYYY')}
                </div>
              </div>
              {i !== workflows.length - 1 ? <Divider /> : null}
            </List.Item>
          ))}
        </List>
      </div>
    );
  };

  // TODO: add a loading spinner for loading state
  return (
    <Layout>
      {renderWorkflows()}
      <Modal
        opened={isCreateModalOpened}
        onClose={createModalActions.close}
        title="Create New Workflow"
      >
        <form
          className="space-y-2"
          onSubmit={form.onSubmit((values) => {
            createWorkflowMutation.mutate(values.title, {
              onSuccess: () => {
                notifications.show({
                  title: 'Success',
                  message: 'Your new workflow is ready',
                });
                createModalActions.close();
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
          <Button type="submit">Create</Button>
        </form>
      </Modal>
    </Layout>
  );
}
