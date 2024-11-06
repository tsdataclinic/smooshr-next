import type {
  FullWorkflow,
  WorkflowSchema_Output,
} from '../../../client/types.gen';
import { Text } from '@mantine/core';
import { FieldsetSchemaValidationEditor } from './FieldsetSchemaValidationEditor';
import { ArrayElementType } from '../../../util/types';
import { match } from 'ts-pattern';

type OperationType = ArrayElementType<
  WorkflowSchema_Output['operations']
>['type'];

type Props = {
  operationType: OperationType;
  workflow: FullWorkflow;
  onClose: () => void;
};

export function OperationEditor({
  operationType,
  workflow,
  onClose,
}: Props): JSX.Element {
  return match(operationType)
    .with('fieldsetSchemaValidation', () => {
      return (
        <FieldsetSchemaValidationEditor onClose={onClose} workflow={workflow} />
      );
    })
    .with('rowCountValidation', 'fileTypeValidation', () => {
      return <Text>This validation type has not been implemented yet.</Text>;
    })
    .exhaustive();
}
