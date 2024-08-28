const WORKFLOWS_BASE_URI = '/workflows';
const ABOUT_BASE_URI = '/about';
const SINGLE_WORKFLOW_BASE_URI = '/workflow';

export function getWorkflowsURI(): string {
  return WORKFLOWS_BASE_URI;
}

export function getAboutURI(): string {
  return ABOUT_BASE_URI;
}

export function getSingleWorkflowBaseURI(): string {
  return SINGLE_WORKFLOW_BASE_URI;
}
