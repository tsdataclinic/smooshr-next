import unittest
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional
from azure.keyvault.secrets import SecretProperties, SecretClient
from server.api.api_keys.azure_api_key_provider import AzureApiKeyProvider

TEST_API_KEY = "test_api_key"
TEST_USER_ID = "test_user_id"

class MockVaultId:
    def __init__(self, name: str):
        self.name = name
    
class MockKeyVaultSecret:
    def __init__(self, value: str, properties: SecretProperties):
        self.value = value
        self.properties = properties

class MockSecretAttributes:
    def __init__(self, expires_on: datetime):
        self.expires = expires_on

class MockSecretClient(SecretClient):
    def __init__(self, secrets: Dict[str, MockKeyVaultSecret]):
        self.secrets = secrets

    def get_secret(self, name: str) -> Optional[MockKeyVaultSecret]:
        return self.secrets.get(name)

    def set_secret(self, api_key, user_id, **kwargs):
        self.secrets[api_key] = MockKeyVaultSecret(user_id, SecretProperties(**kwargs))
        self.secrets[api_key].properties._vault_id = MockVaultId(api_key)
        self.secrets[api_key].properties._attributes = MockSecretAttributes(kwargs.get("expires_on"))
    
    def list_properties_of_secrets(self) -> list[SecretProperties]:
        return [s.properties for s in list(self.secrets.values())]

class TestAzureApiKeyProvider(unittest.TestCase):
    def test_create_api_key(self):
        """Test that we can create an API key. We expect that one of the stored secrets
        in the mock client will have the same info as the one we created."""

        mock_client = MockSecretClient({})
        provider = AzureApiKeyProvider(session=None, kv_client=mock_client)

        now = datetime.now(timezone.utc)
        api_key = provider.create_api_key(TEST_USER_ID, TEST_API_KEY, now + timedelta(days=1))

        self.assertEqual(api_key.api_key, TEST_API_KEY)
        self.assertEqual(api_key.expiration, now + timedelta(days=1))
        self.assertEqual(len(mock_client.secrets), 1)

        self.assertEqual(mock_client.secrets[TEST_API_KEY].properties.tags["user_id"], TEST_USER_ID)
    
    def test_get_api_key(self):
        """Test that we can get an API key."""
        mock_client = MockSecretClient({})
        provider = AzureApiKeyProvider(session=None, kv_client=mock_client)

        now = datetime.now(timezone.utc)
        provider.create_api_key(TEST_USER_ID, TEST_API_KEY, now + timedelta(days=1))

        api_key = provider.get_user_and_expiration(TEST_API_KEY)
        self.assertEqual(api_key, (TEST_USER_ID, now + timedelta(days=1)))
    
    def test_expiration_date_validation_on_creation(self):
        """Test that we can't create an API key with an expired expiration date."""
        mock_client = MockSecretClient({})
        provider = AzureApiKeyProvider(session=None, kv_client=mock_client)

        now = datetime.now(timezone.utc)
        with self.assertRaises(ValueError):
            provider.create_api_key(TEST_USER_ID, TEST_API_KEY, now - timedelta(days=1))

    def test_expiration_date_validation_on_get(self):
        """Test that we can't get an API key with an expired expiration date."""

        mock_client = MockSecretClient({
            TEST_API_KEY: MockKeyVaultSecret(
                TEST_USER_ID, 
                SecretProperties(
                    MockSecretAttributes(expires_on=datetime.now(timezone.utc) - timedelta(days=1))
                )
            )
        })
        provider = AzureApiKeyProvider(session=None, kv_client=mock_client)
        self.assertIsNone(provider.get_user_and_expiration(TEST_API_KEY))
    
    def test_get_api_keys(self):
        """Test that we can get all API keys for a user."""
        mock_client = MockSecretClient({})
        provider = AzureApiKeyProvider(session=None, kv_client=mock_client)
        provider.create_api_key("someotheruser", "someotherkey", datetime.now(timezone.utc) + timedelta(days=1))
        provider.create_api_key(TEST_USER_ID, TEST_API_KEY + "1", datetime.now(timezone.utc) + timedelta(days=1))
        provider.create_api_key(TEST_USER_ID, TEST_API_KEY + "2", datetime.now(timezone.utc) + timedelta(days=1))

        keys = provider.get_api_keys(TEST_USER_ID)
        self.assertEqual(len(keys), 2)
        self.assertEqual(keys[0].api_key, TEST_API_KEY + "1")
        self.assertEqual(keys[1].api_key, TEST_API_KEY + "2")
