import { Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

type Props = {
  tooltip: string;
  size?: number;
  color?: string;
};

export function InfoIcon({
  tooltip,
  color = 'gray',
  size = 20,
}: Props): JSX.Element {
  return (
    <Tooltip label={tooltip}>
      <IconInfoCircle color={color} size={size} />
    </Tooltip>
  );
}
