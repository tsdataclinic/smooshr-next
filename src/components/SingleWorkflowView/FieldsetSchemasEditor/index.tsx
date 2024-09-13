import * as React from 'react';
import { Button } from '@mantine/core';
import { v4 as uuid } from 'uuid';
import { FieldsetSchemaBlock } from './FieldsetSchemaBlock';
import type { FieldsetSchema } from './FieldsetSchemaBlock';

function makeEmptyFieldsetSchema(idx: number): FieldsetSchema {
  return {
    id: uuid(),
    name: idx === 1 ? 'New schema' : `New schema ${idx}`,
    orderMatters: true,
    fields: [],
  };
}

export function FieldsetSchemasEditor(): JSX.Element {
  const [fieldsetSchemas, setFieldsetSchemas] = React.useState<
    readonly FieldsetSchema[]
  >([]);

  const onFieldsetSchemaDelete = React.useCallback(
    (schema: FieldsetSchema) => console.log('Deleted!', schema),
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
        {fieldsetSchemas.map((schema, i) => {
          return (
            <FieldsetSchemaBlock
              key={schema.id}
              fieldsetSchema={fieldsetSchemas[i]}
              onFieldsetSchemaDelete={onFieldsetSchemaDelete}
            />
          );
        })}
      </div>
    </div>
  );
}
