import * as React from 'react';
import { match } from 'ts-pattern';
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
  Stack,
  Affix,
  Menu,
  Drawer,
  Modal,
  List,
  Text,
} from '@mantine/core';
import { IconDots, IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { FieldsetSchemasEditor } from './FieldsetSchemasEditor';
import { OperationEditor } from './OperationEditor';
import { TestWorkflowBlock } from './TestWorkflowBlock';

type ModalViewType = 'fieldsetSchemaEditor' | 'testWorkflow' | 'none';

function getModalTitle(modalView: ModalViewType): string {
  return match(modalView)
    .with('fieldsetSchemaEditor', () => 'Configuring column schemas')
    .with('testWorkflow', () => 'Test workflow')
    .with('none', () => '')
    .exhaustive();
}

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
  const [modalView, setModalView] = React.useState<ModalViewType>('none');
  const fieldsetSchemas = workflow?.schema?.fieldsetSchemas ?? [];

  console.log('Loaded workflow', workflow);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && workflow) {
    const { operations } = workflow.schema;

    const headerRow = (
      <Group>
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
                setModalView('fieldsetSchemaEditor');
                modalActions.open();
              }}
            >
              Add column schemas
            </Menu.Item>
            <Menu.Item disabled>Edit inputs</Menu.Item>
            <Menu.Item disabled>Publish workflow</Menu.Item>
            <Menu.Item
              onClick={() => {
                setModalView('testWorkflow');
                modalActions.open();
              }}
            >
              Test workflow
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    );

    return (
      <>
        <Stack>
          {headerRow}

          <Title order={2}>Validations</Title>
          {operations.length === 0 ? (
            <Text>No validations have been added yet</Text>
          ) : (
            <List
              size="lg"
              className="rounded border border-gray-200 text-left"
            >
              {operations.map((op, i) => {
                return (
                  <List.Item key={op.id}>
                    <div className="flex w-full items-center p-3">
                      <div className="border-r border-gray-400 pr-2">
                        {i + 1}
                      </div>
                      <div className="pl-2">{op.title}</div>
                    </div>
                  </List.Item>
                );
              })}
            </List>
          )}
        </Stack>

        <Affix position={{ bottom: 40, left: 40 }}>
          <Menu withArrow shadow="md" width={250} position="left">
            <Menu.Target>
              <ActionIcon color="blue" radius="xl" size={60}>
                <IconPlus stroke={1.5} size={30} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={bottomDrawerActions.open}>
                Validate column schemas
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Affix>

        <Modal
          opened={isModalOpen}
          onClose={modalActions.close}
          title={getModalTitle(modalView)}
          size="auto"
        >
          {match(modalView)
            .with('fieldsetSchemaEditor', () => {
              return (
                <FieldsetSchemasEditor
                  workflow={workflow}
                  defaultFieldsetSchemas={fieldsetSchemas}
                />
              );
            })
            .with('testWorkflow', () => {
              return <TestWorkflowBlock workflow={workflow} />;
            })
            .with('none', () => null)
            .exhaustive()}
        </Modal>

        <Drawer
          offset={8}
          radius="md"
          opened={isBottomDrawerOpen}
          onClose={bottomDrawerActions.close}
          title="Configuring validation step: checking column schemas"
          withOverlay={false}
          position="bottom"
        >
          <OperationEditor
            operationType="fieldsetSchemaValidation"
            workflow={workflow}
          />
        </Drawer>
      </>
    );
  }

  return <React.Fragment />;
}
