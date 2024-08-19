import * as React from 'react';
import { MsalProvider } from '@azure/msal-react';
import {
  EventMessage,
  EventType,
  PublicClientApplication,
  AuthenticationResult,
} from '@azure/msal-browser';
import { AuthConfig } from './AuthConfig';

export const MSAL_INSTANCE = new PublicClientApplication(
  AuthConfig.azure.client,
);

// TODO: ideally there should be a way of calling this in `main.tsx` before
// the App renders
MSAL_INSTANCE.initialize().then(() => {
  const allAccounts = MSAL_INSTANCE.getAllAccounts();
  if (allAccounts.length > 0) {
    MSAL_INSTANCE.setActiveAccount(allAccounts[0]);
  }

  MSAL_INSTANCE.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      MSAL_INSTANCE.setActiveAccount(account);
    }
  });
});

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props): JSX.Element {
  return <MsalProvider instance={MSAL_INSTANCE}>{children}</MsalProvider>;
}
