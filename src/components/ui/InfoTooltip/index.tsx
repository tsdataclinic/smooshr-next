import { Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

type Props = {
  tooltip: string;
  size?: number;
  color?: string;
};

export function InfoTooltip({
  tooltip,
  color = 'gray',
  size = 20,
}: Props): JSX.Element {
  return (
    <Tooltip multiline label={tooltip} maw={500}>
      <IconInfoCircle color={color} size={size} />
    </Tooltip>
  );
}
