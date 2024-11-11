import { Text } from '@mantine/core';
import { FieldsetSchemaValidationEditor } from './FieldsetSchemaValidationEditor';
import { match } from 'ts-pattern';
import { Operation, OperationType } from './types';
import { FieldsetSchema_Output, WorkflowParam } from '../../../client';

type Props = {
  mode: 'add' | 'update';
  operationType: OperationType;
  onAddOperation: (operation: Operation) => void;
  onUpdateOperation: (operation: Operation) => void;
  onClose: () => void;
  fieldsetSchemas: FieldsetSchema_Output[];
  workflowParams: WorkflowParam[];
};

export function OperationEditor({
  mode,
  operationType,
  onClose,
  onAddOperation,
  onUpdateOperation,
  fieldsetSchemas,
  workflowParams,
}: Props): JSX.Element {
  return match(operationType)
    .with('fieldsetSchemaValidation', () => {
      return (
        <FieldsetSchemaValidationEditor
          mode={mode}
          onClose={onClose}
          onAddOperation={onAddOperation}
          onUpdateOperation={onUpdateOperation}
          fieldsetSchemas={fieldsetSchemas}
          workflowParams={workflowParams}
        />
      );
    })
    .with('rowCountValidation', 'fileTypeValidation', () => {
      return <Text>This validation type has not been implemented yet.</Text>;
    })
    .exhaustive();
}
