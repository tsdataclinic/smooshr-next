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
import { useWorkflowModelContext } from '../WorkflowModelContext';
import { WorkflowUtil } from '../../../util/WorkflowUtil';

export function Workspace(): JSX.Element {
  const workflowModel = useWorkflowModelContext();
  const [isBottomDrawerOpen, bottomDrawerActions] = useDisclosure(false);
  const { operations } = workflowModel.getValues().schema;

  return (
    <>
      <Grid>
        <Grid.Col span={7}>
          <Stack>
            <Stack>
              <Title order={2}>Inputs</Title>
              <ParamsEditor />
            </Stack>
            <Stack>
              <Title order={2}>Column Rules</Title>
              <FieldsetSchemasEditor />
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
                            const newWorkflow =
                              WorkflowUtil.removeOperationByIndex(
                                workflowModel.getValues(),
                                i,
                              );
                            workflowModel.setValues(newWorkflow);
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
          operationType="fieldsetSchemaValidation"
          onClose={bottomDrawerActions.close}
        />
      </Drawer>
    </>
  );
}
