import { Text } from '@mantine/core';
import { FieldsetSchemaValidationEditor } from './FieldsetSchemaValidationEditor';
import { match } from 'ts-pattern';
import { Operation } from './types';
import {
  FieldsetSchema_Output,
  FieldsetSchemaValidation,
  FileTypeValidation,
  WorkflowParam,
} from '../../../client';
import { FileTypeValidationEditor } from './FileTypeValidationEditor';

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
            defaultOperation={operation}
            fieldsetSchemas={fieldsetSchemas}
            workflowParams={workflowParams}
          />
        );
      },
    )
    .with({ type: 'fileTypeValidation' }, (operation: FileTypeValidation) => {
      return (
        <FileTypeValidationEditor
          mode={mode}
          onClose={onClose}
          onAddOperation={onAddOperation}
          onUpdateOperation={onUpdateOperation}
          defaultOperation={operation}
        />
      );
    })
    .with({ type: 'rowCountValidation' }, () => {
      return <Text>This validation type has not been implemented yet.</Text>;
    })
    .exhaustive();
}
