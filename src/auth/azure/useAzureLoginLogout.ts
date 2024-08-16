import { useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { AuthConfig } from '../AuthConfig';

/**
 * Returns functions to kick off the auth flows for Azure AD B2C's
 * login and logout flows.
 *
 * You shouldn't use this hook directly. Instead, use `useDataClinicAuth`
 * which wraps this hook.
 */
export function useAzureLoginLogout(): {
  triggerLoginFlow: () => Promise<void>;
  triggerLogoutFlow: () => Promise<void>;
} {
  const { instance: msalInstance } = useMsal();
  const triggerLoginFlow = useCallback(
    () => msalInstance.loginRedirect(AuthConfig.azure.loginRequest),
    [msalInstance],
  );

  const triggerLogoutFlow = useCallback(
    () => msalInstance.logoutRedirect(),
    [msalInstance],
  );

  return { triggerLoginFlow, triggerLogoutFlow };
}
