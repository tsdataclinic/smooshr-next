import { FullWorkflow } from '../../../client';

type Props = {
  workflow: FullWorkflow;
};

// TODO:
// 1. add Inputs data types to backend
// 2. add endpoints
// 3. load them here
// 4. make them editable

export function InputsEditor({ workflow }: Props): JSX.Element {
  console.log('workflow', workflow);

  return <div>Hello</div>;
}
