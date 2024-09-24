import * as React from 'react';
import { Text, Button } from '@mantine/core';
import { v4 as uuid } from 'uuid';
import { type FieldsetSchema } from '../../../client';
import { FieldsetSchemaBlock } from './FieldsetSchemaBlock';

function makeEmptyFieldsetSchema(idx: number): FieldsetSchema {
  return {
    id: uuid(),
    name: idx === 1 ? 'New schema' : `New schema ${idx}`,
    orderMatters: true,
    fields: [],
    allowExtraColumns: 'no',
  };
}

type Props = {
  defaultFieldsetSchemas: readonly FieldsetSchema[];
};

export function FieldsetSchemasEditor({
  defaultFieldsetSchemas,
}: Props): JSX.Element {
  const [fieldsetSchemas, setFieldsetSchemas] = React.useState<
    readonly FieldsetSchema[]
  >(defaultFieldsetSchemas);

  const onFieldsetSchemaDelete = React.useCallback(
    (schemaToDelete: FieldsetSchema) => {
      setFieldsetSchemas((prevSchemas) => {
        return prevSchemas.filter((schema) => schema.id !== schemaToDelete.id);
      });
    },
    [],
  );

  const onFieldsetSchemaChange = React.useCallback(
    (newSchema: FieldsetSchema) => {
      setFieldsetSchemas((prevSchemas) => {
        return prevSchemas.map((schema) =>
          schema.id === newSchema.id ? newSchema : schema,
        );
      });
    },
    [],
  );

  return (
    <div className="space-y-2">
      <Button
        onClick={() =>
          setFieldsetSchemas((prevSchemas) =>
            prevSchemas.concat(makeEmptyFieldsetSchema(prevSchemas.length + 1)),
          )
        }
      >
        Create new schema
      </Button>

      <div className="space-y-2">
        {fieldsetSchemas.length === 0 ? (
          <Text>No schemas created yet</Text>
        ) : (
          fieldsetSchemas.map((schema, i) => {
            return (
              <FieldsetSchemaBlock
                key={schema.id}
                fieldsetSchema={fieldsetSchemas[i]}
                onFieldsetSchemaDelete={onFieldsetSchemaDelete}
                onFieldsetSchemaChange={onFieldsetSchemaChange}
              />
            );
          })
        )}
      </div>

      <Button
        onClick={() => {
          console.log('Save!', fieldsetSchemas);
          alert('Needs implementation');
        }}
      >
        Save
      </Button>
    </div>
  );
}
