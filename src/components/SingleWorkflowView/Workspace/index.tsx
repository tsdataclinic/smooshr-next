import { Stack, Grid, List, Text, Title } from '@mantine/core';
import { FullWorkflow } from '../../../client';

type Props = { workflow: FullWorkflow };

export function Workspace({ workflow }: Props): JSX.Element {
  const { operations } = workflow.schema;

  return (
    <Grid>
      <Grid.Col span={7}>
        <Stack>
          <Stack>
            <Title order={2}>Workflow Inputs</Title>
            <Text>This feature is not implemented yet.</Text>
          </Stack>
          <Stack>
            <Title order={2}>Column Rules</Title>
            <Text>add UI here</Text>
          </Stack>
        </Stack>
      </Grid.Col>

      <Grid.Col span={5}>
        <Stack>
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
      </Grid.Col>
    </Grid>
  );
}
