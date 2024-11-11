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
import { IconTrash } from '@tabler/icons-react';
import {
  FieldsetSchema_Output,
  WorkflowParam,
  WorkflowSchema_Output,
} from '../../../client';

import { Operation } from '../OperationEditor/types';
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
              <Title order={2}>Inputs</Title>
              <ParamsEditor
                workflowParams={params}
                onWorkflowParamsChange={onWorkflowParamsChange}
              />
            </Stack>
            <Stack>
              <Title order={2}>Column Rulesets</Title>
              <FieldsetSchemasEditor
                fieldsetSchemas={fieldsetSchemas}
                onFieldsetSchemasChange={onFieldsetSchemasChange}
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
                  <Menu.Item onClick={bottomDrawerActions.open}>
                    Apply column rulesets
                  </Menu.Item>
                  <Menu.Item disabled>Check file type</Menu.Item>
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
        title="Configuring validation step: apply colum rulesets"
        withOverlay={false}
        position="bottom"
      >
        <OperationEditor
          mode="add"
          operationType="fieldsetSchemaValidation"
          onClose={bottomDrawerActions.close}
          onAddOperation={(operation: Operation) => {
            onWorkflowOperationsChange([...operations, operation]);
          }}
          onUpdateOperation={(operation: Operation) => {
            onWorkflowOperationsChange(
              operations.map((op) => {
                if (op.id === operation.id) {
                  return operation;
                }
                return op;
              }),
            );
          }}
          fieldsetSchemas={fieldsetSchemas}
          workflowParams={params}
        />
      </Drawer>
    </>
  );
}
