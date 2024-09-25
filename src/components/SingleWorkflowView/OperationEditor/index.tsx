import type {
  FullWorkflow,
  WorkflowSchema_Output,
} from '../../../client/types.gen';
import { FieldsetSchemaValidationEditor } from './FieldsetSchemaValidationEditor';
import { ArrayElementType } from '../../../util/types';

type OperationType = ArrayElementType<
  WorkflowSchema_Output['operations']
>['type'];

type Props = {
  operationType: OperationType;
  workflow: FullWorkflow;
};

export function OperationEditor({
  operationType,
  workflow,
}: Props): JSX.Element {
  switch (operationType) {
    case 'fieldsetSchemaValidation':
      return <FieldsetSchemaValidationEditor workflow={workflow} />;
    default:
      throw new Error('Not implemented yet');
  }
}
