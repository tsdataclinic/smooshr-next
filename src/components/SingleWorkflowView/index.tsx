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
  Drawer,
  TextInput,
  Modal,
  Text,
} from '@mantine/core';
import { IconDots, IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { FieldsetSchemasEditor } from './FieldsetSchemasEditor';

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

  const [isBottomDrawerOpen, bottomDrawerActions] = useDisclosure(false);
  const [isModalOpen, modalActions] = useDisclosure(false);
  const schemaForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: 'Validate column schemas',
      headers: [],
    },
  });

  const fieldsetSchemas = workflow?.schema?.fieldsetSchemas ?? [];

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
                <Menu.Item onClick={modalActions.open}>
                  Add column schemas
                </Menu.Item>
                <Menu.Item disabled>Edit inputs</Menu.Item>
                <Menu.Item disabled>Publish workflow</Menu.Item>
                <Menu.Item disabled>Test workflow</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <p>This page is still a work in progress.</p>
          <Affix position={{ bottom: 40, left: 40 }}>
            <Menu withArrow shadow="md" width={150} position="left">
              <Menu.Target>
                <ActionIcon color="blue" radius="xl" size={60}>
                  <IconPlus stroke={1.5} size={30} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu
                  closeOnItemClick={false}
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
                    <Menu.Item onClick={bottomDrawerActions.open}>
                      Validate column schemas
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Menu.Dropdown>
            </Menu>
          </Affix>

          <Modal
            opened={isModalOpen}
            onClose={modalActions.close}
            title="Configuring column schemas"
          >
            <FieldsetSchemasEditor defaultFieldsetSchemas={fieldsetSchemas} />
          </Modal>

          <Drawer
            offset={8}
            radius="md"
            opened={isBottomDrawerOpen}
            onClose={bottomDrawerActions.close}
            title="Configuring validation step: checking column headers"
            withOverlay={false}
            position="bottom"
          >
            <form
              onSubmit={schemaForm.onSubmit((values) => {
                console.log(values);
              })}
              className="space-y-2"
            >
              <TextInput
                key={schemaForm.key('title')}
                required
                label="Action Title"
                {...schemaForm.getInputProps('title')}
              />
              <Text>TODO: Select which fieldset to use</Text>
              <Button type="submit">Save</Button>
            </form>
          </Drawer>
        </>
      ) : null}
    </>
  );
}
