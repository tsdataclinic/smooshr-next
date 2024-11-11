import { Text } from '@mantine/core';
import { FieldsetSchemaValidationEditor } from './FieldsetSchemaValidationEditor';
import { match, P } from 'ts-pattern';
import { Operation } from './types';
import {
  FieldsetSchema_Output,
  FieldsetSchemaValidation,
  WorkflowParam,
} from '../../../client';

type Props = {
  mode: 'add' | 'update';
  onAddOperation: (operation: Operation) => void;
  onUpdateOperation: (operation: Operation) => void;
  onClose: () => void;
  fieldsetSchemas: FieldsetSchema_Output[];
  workflowParams: WorkflowParam[];
  defaultOperation: Operation;
};

export function OperationEditor({
  mode,
  onClose,
  onAddOperation,
  onUpdateOperation,
  fieldsetSchemas,
  workflowParams,
  defaultOperation,
}: Props): JSX.Element {
  return match(defaultOperation)
    .with(
      { type: 'fieldsetSchemaValidation' },
      (operation: FieldsetSchemaValidation) => {
        return (
          <FieldsetSchemaValidationEditor
            mode={mode}
            onClose={onClose}
            onAddOperation={onAddOperation}
            onUpdateOperation={onUpdateOperation}
            fieldsetSchemas={fieldsetSchemas}
            workflowParams={workflowParams}
            defaultOperation={operation}
          />
        );
      },
    )
    .with({ type: P.union('rowCountValidation', 'fileTypeValidation') }, () => {
      return <Text>This validation type has not been implemented yet.</Text>;
    })
    .exhaustive();
}
