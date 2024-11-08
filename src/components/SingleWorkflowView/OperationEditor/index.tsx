import type { WorkflowSchema_Output } from '../../../client/types.gen';
import { Text } from '@mantine/core';
import { FieldsetSchemaValidationEditor } from './FieldsetSchemaValidationEditor';
import { ArrayElementType } from '../../../util/types';
import { match } from 'ts-pattern';

type OperationType = ArrayElementType<
  WorkflowSchema_Output['operations']
>['type'];

type Props = {
  operationType: OperationType;
  onClose: () => void;
};

export function OperationEditor({
  operationType,
  onClose,
}: Props): JSX.Element {
  return match(operationType)
    .with('fieldsetSchemaValidation', () => {
      return <FieldsetSchemaValidationEditor onClose={onClose} />;
    })
    .with('rowCountValidation', 'fileTypeValidation', () => {
      return <Text>This validation type has not been implemented yet.</Text>;
    })
    .exhaustive();
}
