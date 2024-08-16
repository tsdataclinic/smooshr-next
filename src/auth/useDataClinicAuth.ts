import { useCallback } from 'react';
import { useAzureLoginLogout } from './azure/useAzureLoginLogout';

export function useDataClinicAuth(): {
  login: () => Promise<void>;
  logout: () => Promise<void>;
} {
  const { triggerLoginFlow, triggerLogoutFlow } = useAzureLoginLogout();

  const login = useCallback(async () => {
    try {
      // this triggers a redirect so the page will automatically reload when
      // we return
      await triggerLoginFlow();

      // just in case, forcing a reload here to make sure all application
      // state gets reset correctly
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  }, [triggerLoginFlow]);

  const logout = useCallback(async () => {
    try {
      await triggerLogoutFlow();

      // refresh the page after logging in to make sure all application state
      // gets reset correctly
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
    // }, [triggerLogoutFlow, apolloClient]);
  }, [triggerLogoutFlow]);

  return {
    login,
    logout,
  };
}
