import { AzureAuthConfig } from './azure/types';

export const AuthConfig: {
  azure: AzureAuthConfig;
} = {
  azure: {
    client: {
      auth: {
        clientId: import.meta.env.VITE_AZURE_APP_CLIENT_ID || '',
        authority: import.meta.env.VITE_AZURE_FULL_AUTHORITY_URL || '',
        knownAuthorities: (import.meta.env.VITE_AZURE_AUTHORITIES || '').split(
          ';',
        ),
        redirectUri: import.meta.env.VITE_CLIENT_URI || '',
      },
    },

    api: {
      b2cScopes: (import.meta.env.VITE_AZURE_B2C_SCOPES || '').split(';'),
    },

    loginRequest: {
      scopes: ['openid', 'offline_access'],
      prompt: 'select_account',
    },
  },
};
