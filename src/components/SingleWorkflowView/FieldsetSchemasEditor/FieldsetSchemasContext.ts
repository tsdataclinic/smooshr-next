import { createFormContext } from '@mantine/form';
import type { FieldsetSchema_Output } from '../../../client';

type FieldsetSchemasFormValues = {
  fieldsetSchemas: FieldsetSchema_Output[];
};

export const [
  FieldsetSchemasFormProvider,
  useFieldsetSchemasFormContext,
  useFieldsetSchemasForm,
] = createFormContext<FieldsetSchemasFormValues>();
