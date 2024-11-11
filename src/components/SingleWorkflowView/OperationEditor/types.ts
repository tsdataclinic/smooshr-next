import { ArrayElementType } from '../../../util/types';

import { WorkflowSchema_Output } from '../../../client';

export type Operation = ArrayElementType<WorkflowSchema_Output['operations']>;
export type OperationType = Operation['type'];
