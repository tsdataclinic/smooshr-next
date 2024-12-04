import { ActionIcon, Group, TextInput, Title } from '@mantine/core';
import { useField } from '@mantine/form';
import { useFocusTrap } from '@mantine/hooks';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import * as React from 'react';

type Props = {
  defaultTitle: string;
  onTitleSave: (newTitle: string) => void;
};

function validateTitle(title: string): string | null {
  if (title === '') {
    return 'Title is required';
  }
  return null;
}

function isTitleValid(title: string): boolean {
  return validateTitle(title) === null;
}

export function TitleInput({ defaultTitle, onTitleSave }: Props): JSX.Element {
  const [prevTitle, setPrevTitle] = React.useState(defaultTitle);
  const [isEditing, setIsEditing] = React.useState(false);
  const titleField = useField({
    initialValue: defaultTitle,
    validate: validateTitle,
    validateOnChange: true,
  });

  const focusTrapRef = useFocusTrap();
  const currentTitle = titleField.getValue();

  return (
    <>
      {isEditing ? (
        <TextInput
          {...titleField.getInputProps()}
          size="lg"
          defaultValue={defaultTitle}
          ref={focusTrapRef}
        />
      ) : (
        <Title order={1}>{currentTitle}</Title>
      )}
      <Group>
        <ActionIcon
          color="dark"
          disabled={isEditing && !isTitleValid(currentTitle)}
          variant="transparent"
          style={(theme) => ({
            '--ai-hover-color': theme.colors.blue[7],
          })}
          onClick={() => {
            if (isEditing) {
              setPrevTitle(currentTitle);
              onTitleSave(currentTitle);
            }
            setIsEditing((prev) => !prev);
          }}
        >
          {isEditing ? <IconCheck /> : <IconEdit />}
        </ActionIcon>

        {isEditing ? (
          <ActionIcon
            color="dark"
            variant="transparent"
            style={(theme) => ({
              '--ai-hover-color': theme.colors.blue[7],
            })}
            onClick={() => {
              // cancel edit
              setIsEditing(false);
              titleField.setValue(prevTitle);
            }}
          >
            <IconX />
          </ActionIcon>
        ) : null}
      </Group>
    </>
  );
}
