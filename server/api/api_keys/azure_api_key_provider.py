from datetime import datetime, timezone
from typing import Optional, Tuple, Callable
from sqlalchemy.orm import Session
from sqlalchemy import select
from azure.keyvault.secrets import SecretClient, SecretProperties

from server.api.api_keys.api_key_provider import ApiKeyProvider
from server.models.apikey.api_schemas import ApiKey
from server.models.apikey.db_model import DBApiKey

from enum import Enum

class AzureApiKeyProvider(ApiKeyProvider):
    def __init__(self, session: Session, kv_client: SecretClient, **kwargs):
        self.kv_client = kv_client
        self.db_session = session

    def _filter_by_user_id(self, user_id: str) -> Callable[[SecretProperties], bool]:
        return lambda secret: secret.tags.get("user_id") == user_id if secret.tags else False

    def get_user_and_expiration(self, api_key: str) -> Optional[Tuple[str, datetime]]:
        secret = self.kv_client.get_secret(api_key)

        if secret and self.is_date_valid(secret.properties.expires_on):
            return secret.value, secret.properties.expires_on

    def create_api_key(self, user_id: str, api_key: str, expiration: datetime) -> ApiKey:
        if not self.is_date_valid(expiration):
            raise ValueError("Expiration date is in the past.")
        
        self.kv_client.set_secret(api_key, user_id, expires_on=expiration, tags={"user_id": user_id})

        return ApiKey(api_key=api_key, expiration=expiration)

    def delete_api_key(self, user_id: str, api_key: str) -> bool:
        poller = self.kv_client.begin_delete_secret(api_key)
        poller.result()

        return True

    def get_api_keys(self, user_id: str) -> list[ApiKey]:
        keys = filter(self._filter_by_user_id(user_id), self.kv_client.list_properties_of_secrets())
        return [ApiKey(api_key=key.name, expiration=key.expires_on) for key in keys]
