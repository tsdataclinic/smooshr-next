import { createFormContext } from '@mantine/form';
import { FullWorkflow } from '../../client';

export const [
  WorkflowModelProvider,
  useWorkflowModelContext,
  useWorkflowModel,
] = createFormContext<FullWorkflow>();
