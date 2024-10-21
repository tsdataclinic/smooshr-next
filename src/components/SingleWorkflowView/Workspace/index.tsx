import {
  Drawer,
  Group,
  Stack,
  Grid,
  List,
  Text,
  Title,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FullWorkflow } from '../../../client';
import { FieldsetSchemasEditor } from '../FieldsetSchemasEditor';
import { OperationEditor } from '../OperationEditor';
import { InputsEditor } from '../InputsEditor';

type Props = { workflow: FullWorkflow };

export function Workspace({ workflow }: Props): JSX.Element {
  const [isBottomDrawerOpen, bottomDrawerActions] = useDisclosure(false);
  const { fieldsetSchemas, operations } = workflow.schema;

  return (
    <>
      <Grid>
        <Grid.Col span={7}>
          <Stack>
            <Stack>
              <Title order={2}>Inputs</Title>
              <InputsEditor workflow={workflow} />
            </Stack>
            <Stack>
              <Title order={2}>Column Rules</Title>
              <FieldsetSchemasEditor
                workflow={workflow}
                defaultFieldsetSchemas={fieldsetSchemas}
              />
            </Stack>
          </Stack>
        </Grid.Col>

        <Grid.Col span={5}>
          <Stack>
            <Group justify="space-between">
              <Title order={2}>Validations</Title>
              <Button onClick={bottomDrawerActions.open}>
                Add new validation step
              </Button>
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
        </Grid.Col>
      </Grid>

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
