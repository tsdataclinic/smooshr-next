import './App.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Layout } from './components/Layout';
import { Redirect, Route, Switch } from 'wouter';

function App() {
  return (
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
  );
}

export default App;
