import { getSingleWorkflowBaseURI } from './uriUtil';

export const WorkflowUtil = {
  QUERY_KEYS: {
    all: ['workflows'],
    workflow: (id: string) => ['workflows', id],
  },
  getWorkflowURI(id: string) {
    return `${getSingleWorkflowBaseURI()}/${id}`;
  },
};
