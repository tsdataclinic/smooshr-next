import { Text, Button, Stack } from '@mantine/core';
import { v4 as uuid } from 'uuid';
import type { FieldsetSchema_Output } from '../../../client';
import { FieldsetSchemaBlock } from './FieldsetSchemaBlock';
import { useWorkflowModelContext } from '../WorkflowModelContext';
import { WorkflowUtil } from '../../../util/WorkflowUtil';

function makeEmptyFieldsetSchema(idx: number): FieldsetSchema_Output {
  return {
    id: uuid(),
    name: idx === 1 ? 'New schema' : `New schema ${idx}`,
    orderMatters: true,
    fields: [],
    allowExtraColumns: 'no',
  };
}

export function FieldsetSchemasEditor(): JSX.Element {
  const workflowModel = useWorkflowModelContext();
  const { fieldsetSchemas } = workflowModel.getValues().schema;

  return (
    <form>
      <Stack>
        <Button
          style={{ alignSelf: 'flex-start' }}
          variant="outline"
          onClick={() => {
            const newWorkflow = WorkflowUtil.insertFieldsetSchema(
              workflowModel.getValues(),
              makeEmptyFieldsetSchema(fieldsetSchemas.length + 1),
            );
            workflowModel.setValues(newWorkflow);
          }}
        >
          Add new ruleset
        </Button>
        <div className="space-y-2">
          {fieldsetSchemas.length === 0 ? (
            <Text>No schemas created yet</Text>
          ) : (
            fieldsetSchemas.map((schema, i) => {
              return <FieldsetSchemaBlock key={schema.id} index={i} />;
            })
          )}
        </div>
      </Stack>
    </form>
  );
}
