import { FieldsetSchema_Output, FullWorkflow } from '../client';
import { getSingleWorkflowBaseURI } from './uriUtil';

export const WorkflowUtil = {
  QUERY_KEYS: {
    all: ['workflows'],
    workflow: (id: string): [string, string] => ['workflows', id],
  },

  getWorkflowURI(id: string): string {
    return `${getSingleWorkflowBaseURI()}/${id}`;
  },

  updateFieldsetSchemas(
    workflow: FullWorkflow,
    fieldsetSchemas: readonly FieldsetSchema_Output[],
  ): FullWorkflow {
    return {
      ...workflow,
      schema: {
        ...workflow.schema,
        fieldsetSchemas: fieldsetSchemas as FieldsetSchema_Output[],
      },
    };
  },
};
