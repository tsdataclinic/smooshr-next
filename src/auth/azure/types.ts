import { Configuration, RedirectRequest } from '@azure/msal-browser';

// configuration for Azure AD B2C
export interface AzureAuthConfig {
  api: {
    // scopes needed to access the app's API
    b2cScopes: string[];
  };
  client: Configuration;
  loginRequest: RedirectRequest;
}
