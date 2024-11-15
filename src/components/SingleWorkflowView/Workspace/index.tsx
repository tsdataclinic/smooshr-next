import * as React from 'react';
import {
  Drawer,
  Group,
  Stack,
  Grid,
  List,
  Text,
  Title,
  Button,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FieldsetSchemasEditor } from '../FieldsetSchemasEditor';
import { OperationEditor } from '../OperationEditor';
import { ParamsEditor } from '../ParamsEditor';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  FieldsetSchema_Output,
  WorkflowParam,
  WorkflowSchema_Output,
} from '../../../client';
import { v4 as uuid } from 'uuid';
import { Operation } from '../OperationEditor/types';
import { InfoTooltip } from '../../ui/InfoTooltip';

type Props = {
  workflowSchema: WorkflowSchema_Output;
  onWorkflowSchemaChange: (workflowSchema: WorkflowSchema_Output) => void;
};

export function Workspace({
  workflowSchema,
  onWorkflowSchemaChange,
}: Props): JSX.Element {
  const [isBottomDrawerOpen, bottomDrawerActions] = useDisclosure(false);
  const { fieldsetSchemas, operations, params } = workflowSchema;
  const [operationEditorMode, setOperationEditorMode] = React.useState<
    'add' | 'update'
  >('add');
  const [operationToEdit, setOperationToEdit] = React.useState<
    Operation | undefined
  >(undefined);

  const onWorkflowParamsChange = React.useCallback(
    (newParams: WorkflowParam[]) => {
      onWorkflowSchemaChange({
        ...workflowSchema,
        params: newParams,
      });
    },
    [workflowSchema, onWorkflowSchemaChange],
  );

  const onFieldsetSchemasChange = React.useCallback(
    (newFieldsetSchemas: FieldsetSchema_Output[]) => {
      onWorkflowSchemaChange({
        ...workflowSchema,
        fieldsetSchemas: newFieldsetSchemas,
      });
    },
    [workflowSchema, onWorkflowSchemaChange],
  );

  const onWorkflowOperationsChange = React.useCallback(
    (newOperations: WorkflowSchema_Output['operations']) => {
      onWorkflowSchemaChange({
        ...workflowSchema,
        operations: newOperations,
      });
    },
    [workflowSchema, onWorkflowSchemaChange],
  );

  return (
    <>
      <Grid>
        <Grid.Col span={7}>
          <Stack>
            <Stack>
              <Group>
                <Title order={2}>Inputs</Title>
                <InfoTooltip
                  color="black"
                  tooltip="Inputs are parameters that can be sent to the workflow when it is run. You can refer to them when configuring validations."
                />
              </Group>
              <ParamsEditor
                workflowParams={params}
                onWorkflowParamsChange={onWorkflowParamsChange}
              />
            </Stack>
            <Stack>
              <Group>
                <Title order={2}>Column Rulesets</Title>
                <InfoTooltip
                  color="black"
                  tooltip="Rulesets are collections of rules to validate the columns of a dataset. You can refer to them when configuring a new validation step."
                />
              </Group>
              <FieldsetSchemasEditor
                fieldsetSchemas={fieldsetSchemas}
                onFieldsetSchemasChange={onFieldsetSchemasChange}
                workflowParams={params}
              />
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={5}>
          <Stack>
            <Group justify="space-between">
              <Title order={2}>Validations</Title>

              <Menu>
                <Menu.Target>
                  <Button variant="outline">Add new validation step</Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={() => {
                      setOperationEditorMode('add');
                      // create an empty fieldset schema validation operation
                      setOperationToEdit({
                        type: 'fieldsetSchemaValidation',
                        id: uuid(),
                        title: 'Apply column ruleset',
                        description: '',
                        fieldsetSchema: '',
                      });
                      bottomDrawerActions.open();
                    }}
                  >
                    Apply column rulesets
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setOperationEditorMode('add');
                      setOperationToEdit({
                        type: 'fileTypeValidation',
                        id: uuid(),
                        title: 'Check file type',
                        description: '',
                        expectedFileType: '.csv',
                      });
                      bottomDrawerActions.open();
                    }}
                  >
                    Check file type
                  </Menu.Item>
                  <Menu.Item disabled>Check row counts</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
            {operations.length === 0 ? (
              <Text>No validations have been added yet</Text>
            ) : (
              <List
                size="lg"
                className="rounded border border-gray-200 text-left"
              >
                {operations.map((op, i) => {
                  return (
                    <List.Item
                      key={op.id}
                      classNames={{
                        itemWrapper: 'w-full',
                        itemLabel: 'w-full',
                      }}
                    >
                      <div className="flex w-full items-center p-3">
                        <div className="border-r border-gray-400 pr-2">
                          {i + 1}
                        </div>
                        <div className="grow pl-2">{op.title}</div>

                        <ActionIcon
                          variant="transparent"
                          color="dark"
                          size="sm"
                          onClick={() => {
                            setOperationEditorMode('update');
                            setOperationToEdit(op);
                            bottomDrawerActions.open();
                          }}
                        >
                          <IconEdit />
                        </ActionIcon>

                        <ActionIcon
                          variant="transparent"
                          color="dark"
                          size="sm"
                          onClick={() => {
                            // delete the operation
                            onWorkflowOperationsChange(
                              operations.filter(
                                (operation) => operation.id !== op.id,
                              ),
                            );
                          }}
                        >
                          <IconTrash />
                        </ActionIcon>
                      </div>
                    </List.Item>
                  );
                })}
              </List>
            )}
          </Stack>
        </Grid.Col>
      </Grid>

      <Drawer
        offset={8}
        radius="md"
        opened={isBottomDrawerOpen}
        onClose={bottomDrawerActions.close}
        title="Configuring validation step"
        withOverlay={false}
        position="bottom"
      >
        {operationToEdit ? (
          <OperationEditor
            mode={operationEditorMode}
            onClose={bottomDrawerActions.close}
            onAddOperation={(operation: Operation) => {
              onWorkflowOperationsChange([...operations, operation]);
            }}
            onUpdateOperation={(operation: Operation) => {
              onWorkflowOperationsChange(
                operations.map((op) => {
                  return op.id === operation.id ? operation : op;
                }),
              );
            }}
            fieldsetSchemas={fieldsetSchemas}
            workflowParams={params}
            defaultOperation={operationToEdit}
          />
        ) : null}
      </Drawer>
    </>
  );
}
