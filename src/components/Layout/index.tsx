import * as React from 'react';
import { AppShell, Group, Stack, Burger, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'wouter';
import { useDataClinicAuth } from '../../auth/useDataClinicAuth';
import { useIsAuthenticated } from '../../auth/useIsAuthenticated';
import { getAboutURI, getWorkflowsURI } from '../../util/uriUtil';

type Props = {
  children: React.ReactNode;
};

export function Layout({ children }: Props): JSX.Element {
  const { login, logout } = useDataClinicAuth();
  const isAuthenticated = useIsAuthenticated();
  const [isOpen, { toggle }] = useDisclosure();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !isOpen },
      }}
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
          <Link to={getWorkflowsURI()}>Workflows</Link>
          <Link to={getAboutURI()}>About</Link>
          <Button
            unstyled
            style={{ textAlign: 'left' }}
            onClick={async () => {
              if (isAuthenticated) {
                await logout();
              } else {
                await login();
              }
            }}
          >
            {isAuthenticated ? 'Sign out' : 'Sign in'}
          </Button>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
