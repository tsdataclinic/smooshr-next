import * as React from 'react';
import {
  Container,
  Text,
  AppShell,
  Group,
  Burger,
  Button,
} from '@mantine/core';
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

  const navbarContent = (
    <>
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
    </>
  );

  console.log('auth?', isAuthenticated);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { desktop: true, mobile: !isOpen },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={isOpen} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group className="flex-1" justify="space-between">
            <span>
              Smooshr 2.0
              <span className="text-xs"> by Data Clinic</span>
            </span>
            <Group ml="xl" gap="sm" visibleFrom="sm">
              {navbarContent}
            </Group>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar py="md" px={4}>
        {navbarContent}
      </AppShell.Navbar>
      <AppShell.Main>
        {isAuthenticated ? (
          children
        ) : (
          <Container ta="center">
            <Text size="lg">
              You are not signed in. Please sign in to use this app.
            </Text>
          </Container>
        )}
      </AppShell.Main>
    </AppShell>
  );
}
