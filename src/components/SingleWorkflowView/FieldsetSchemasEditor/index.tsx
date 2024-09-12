import * as React from 'react';
import {
  TextInput,
  Checkbox,
  Fieldset,
  Title,
  FileButton,
  Button,
  List,
} from '@mantine/core';
import * as Papa from 'papaparse';
import type { Brand } from '../../../util/types';
import { v4 as uuid } from 'uuid';

type FieldsetId = Brand<string, 'FieldsetId'>;
type FieldsetSchema = {
  id: FieldsetId;
  name: string;
  orderMatters: boolean;
  fields: ReadonlyArray<{
    name: string;
  }>;
};

function makeEmptyFieldsetSchema(idx: number): FieldsetSchema {
  return {
    id: uuid() as FieldsetId,
    name: idx === 1 ? 'New schema' : `New schema ${idx}`,
    orderMatters: true,
    fields: [],
  };
}

function useCSVFieldsetParser(): [
  FieldsetSchema | undefined,
  (file: File | null) => void,
] {
  const [fieldsetSchema, setFieldsetSchema] = React.useState<
    FieldsetSchema | undefined
  >(undefined);

  const setCSVInfo = React.useCallback((file: File | null) => {
    if (file) {
      Papa.parse(file, {
        complete: (parsedResult): void => {
          setFieldsetSchema({
            id: uuid() as FieldsetId,
            name: file.name,
            orderMatters: true,
            fields:
              parsedResult.meta.fields?.map((header) => {
                return {
                  name: header,
                };
              }) ?? [],
          });
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  }, []);

  return [fieldsetSchema, setCSVInfo];
}

function FieldsetSchemaBlock({
  fieldsetSchema,
}: {
  fieldsetSchema: FieldsetSchema;
}): JSX.Element {
  const [, setParsedFieldsetSchema] = useCSVFieldsetParser();

  // TODO: YOU ARE HERE. We should say "Either create manually or upload CSV to extract reference"
  if (fieldsetSchema === undefined) {
    return (
      <div>
        Create manually or add CSV
        <FileButton onChange={setParsedFieldsetSchema} accept=".csv">
          {(props) => <Button {...props}>Create new schema from CSV</Button>}
        </FileButton>
      </div>
    );
  }

  return (
    <form>
      <Fieldset className="space-y-2" legend={fieldsetSchema.name}>
        <p>
          add 3 dots to top right with menu option to create schema from CSV
        </p>
        <TextInput defaultValue={fieldsetSchema.name} />
        <Checkbox defaultChecked label="Order matters" />
        <Title order={6}>Headers</Title>
        <List>
          {fieldsetSchema.fields.map((field) => {
            return (
              <List.Item key={field.name}>
                {field.name}: datatype [add validators]
              </List.Item>
            );
          })}
        </List>
      </Fieldset>
    </form>
  );
}

export function FieldsetSchemasEditor(): JSX.Element {
  const [fieldsetSchemas, setFieldsetSchemas] = React.useState<
    readonly FieldsetSchema[]
  >([]);

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
            />
          );
        })}
      </div>
    </div>
  );
}
