import {
  FieldsetSchema_Output,
  FullWorkflow,
  WorkflowSchema_Output,
  WorkflowParam,
  ParamReference,
} from '../client';
import { getSingleWorkflowBaseURI } from './uriUtil';
import { ArrayElementType } from './types';

export const WorkflowUtil = {
  QUERY_KEYS: {
    all: ['workflows'],
    workflow: (id: string): [string, string] => ['workflows', id],
  },

  WorkflowParam: {
    toReferenceString(param: WorkflowParam): string {
      return `param:${param.id}`;
    },
  },

  ParamReference: {
    isReferenceString(stringToTest: string): boolean {
      return stringToTest.startsWith('param:');
    },

    toReferenceString(param: ParamReference): string {
      return `param:${param.paramId}`;
    },

    fromReferenceString(paramReferenceString: string): ParamReference {
      return {
        paramId: paramReferenceString.substring(6),
      };
    },
  },

  getWorkflowURI(id: string): string {
    return `${getSingleWorkflowBaseURI()}/${id}`;
  },

  updateWorkflowParams(
    workflow: FullWorkflow,
    params: readonly WorkflowParam[],
  ): FullWorkflow {
    return {
      ...workflow,
      schema: {
        ...workflow.schema,
        params: params as WorkflowParam[],
      },
    };
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

  insertOperation(
    workflow: FullWorkflow,
    operation: ArrayElementType<WorkflowSchema_Output['operations']>,
  ): FullWorkflow {
    return {
      ...workflow,
      schema: {
        ...workflow.schema,
        operations: workflow.schema.operations.concat([operation]),
      },
    };
  },

  updateOperation(
    workflow: FullWorkflow,
    operationToUpdate: ArrayElementType<WorkflowSchema_Output['operations']>,
  ): FullWorkflow {
    return {
      ...workflow,
      schema: {
        ...workflow.schema,
        operations: workflow.schema.operations.map((op) =>
          op.id === operationToUpdate.id ? operationToUpdate : op,
        ),
      },
    };
  },
};
