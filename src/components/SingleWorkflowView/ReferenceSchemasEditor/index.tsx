import * as React from 'react';
import { FileButton, Button, Text } from '@mantine/core';

export function ReferenceSchemasEditor(): JSX.Element {
  const [file, setFile] = React.useState<File | null>(null);

  return (
    <div>
      <FileButton onChange={setFile} accept=".csv">
        {(props) => <Button {...props}>Add CSV</Button>}
      </FileButton>

      {file ? (
        <Text size="sm" ta="center" mt="sm">
          Picked file: {file.name}
        </Text>
      ) : null}
    </div>
  );
}
