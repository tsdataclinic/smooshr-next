import { useIsAuthenticated as useAzureIsAuthenticated } from '@azure/msal-react';

/**
 * A hook which tells us if the user is authenticated.
 *
 * Eventually this should support other authentication services, but for now
 * it simply returns whether or not we are authenticatred with Azure.
 *
 * @returns boolean
 */
export function useIsAuthenticated(): boolean {
  const isAzureAuthenticated = useAzureIsAuthenticated();
  return isAzureAuthenticated;
}
