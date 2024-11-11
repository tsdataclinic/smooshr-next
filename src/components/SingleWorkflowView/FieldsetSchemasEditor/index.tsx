import * as React from 'react';
import { Text, Button, Stack } from '@mantine/core';
import { v4 as uuid } from 'uuid';
import type { FieldsetSchema_Output } from '../../../client';
import { FieldsetSchemaBlock } from './FieldsetSchemaBlock';

function makeEmptyFieldsetSchema(idx: number): FieldsetSchema_Output {
  return {
    id: uuid(),
    name: idx === 1 ? 'New schema' : `New schema ${idx}`,
    orderMatters: true,
    fields: [],
    allowExtraColumns: 'no',
  };
}

type Props = {
  fieldsetSchemas: FieldsetSchema_Output[];
  onFieldsetSchemasChange: (fieldsetSchemas: FieldsetSchema_Output[]) => void;
};

export function FieldsetSchemasEditor({
  fieldsetSchemas,
  onFieldsetSchemasChange,
}: Props): JSX.Element {
  const onFieldsetSchemaChange = React.useCallback(
    (index: number, fieldsetSchema: FieldsetSchema_Output) => {
      onFieldsetSchemasChange([
        ...fieldsetSchemas.slice(0, index),
        fieldsetSchema,
        ...fieldsetSchemas.slice(index + 1),
      ]);
    },
    [fieldsetSchemas, onFieldsetSchemasChange],
  );

  const onFieldsetSchemaDelete = React.useCallback(
    (index: number) => {
      onFieldsetSchemasChange(fieldsetSchemas.filter((_, i) => i !== index));
    },
    [fieldsetSchemas, onFieldsetSchemasChange],
  );

  return (
    <form>
      <Stack>
        <Button
          style={{ alignSelf: 'flex-start' }}
          variant="outline"
          onClick={() => {
            onFieldsetSchemasChange(
              fieldsetSchemas.concat([
                makeEmptyFieldsetSchema(fieldsetSchemas.length + 1),
              ]),
            );
          }}
        >
          Add new ruleset
        </Button>
        <div className="space-y-2">
          {fieldsetSchemas.length === 0 ? (
            <Text>No schemas created yet</Text>
          ) : (
            fieldsetSchemas.map((fieldsetSchema, i) => {
              return (
                <FieldsetSchemaBlock
                  key={fieldsetSchema.id}
                  index={i}
                  fieldsetSchema={fieldsetSchema}
                  onFieldsetSchemaChange={onFieldsetSchemaChange}
                  onFieldsetSchemaDelete={onFieldsetSchemaDelete}
                />
              );
            })
          )}
        </div>
      </Stack>
    </form>
  );
}
