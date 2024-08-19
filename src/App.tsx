import './App.css';
import '@mantine/core/styles.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Layout } from './components/Layout';
import { Redirect, Route, Switch } from 'wouter';
import { AuthProvider } from './auth/AuthProvider';
import { client as APIClient } from './client';
import { getAuthToken } from './auth/getAuthToken';

APIClient.setConfig({
  baseUrl: import.meta.env.VITE_SERVER_URI || '',
  throwOnError: true,
});

APIClient.interceptors.request.use(async (request) => {
  const token = (await getAuthToken()) ?? 'not_found';
  request.headers.set('Authorization', `Bearer ${token}`);
  return request;
});

const QUERY_CLIENT = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={QUERY_CLIENT}>
        <MantineProvider>
          <Switch>
            <Route path="/">
              <Redirect to="/projects" />
            </Route>
            <Route path="/projects">
              <Layout>Projects page</Layout>
            </Route>
            <Route path="/about">
              <Layout>About page</Layout>
            </Route>
            <Route>404: No such page!</Route>
          </Switch>
        </MantineProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
