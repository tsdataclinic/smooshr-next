import * as React from 'react';
import { AppShell, Group, Stack, Burger, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'wouter';

type Props = {
  children: React.ReactNode;
};

export function Layout({ children }: Props): JSX.Element {
  const [isOpen, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !isOpen } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={isOpen} onClick={toggle} hiddenFrom="sm" size="sm" />
          <span>
            Smooshr 2.0
            <span className="text-xs"> by Data Clinic</span>
          </span>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <Link to="/projects">Projects</Link>
          <Link to="/about">About</Link>
          <Link to="/sign-out">Sign Out</Link>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
