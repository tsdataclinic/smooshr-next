from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select

from server.api.api_keys.api_key_provider import ApiKeyProvider
from server.models.apikey.api_schemas import ApiKey
from server.models.apikey.db_model import DBApiKey

from enum import Enum

class DbApiKeyProvider(ApiKeyProvider):
    def __init__(self, db_session: Session, **kwargs):
        self.db_session = db_session

    def _get_api_key_record(self, api_key: str) -> Optional[DBApiKey]:
        stmt = select(DBApiKey).where(DBApiKey.api_key == api_key)
        return self.db_session.execute(stmt).scalar_one_or_none()
    
    def _get_api_keys_for_user(self, user_id: str) -> list[DBApiKey]:
        stmt = select(DBApiKey).where(DBApiKey.user== user_id)
        return self.db_session.execute(stmt).scalars().all()

    def get_user_and_expiration(self, api_key: str) -> Optional[Tuple[str, datetime]]:
        result = self._get_api_key_record(api_key)
        if result and self.is_date_valid(result.expiration):
            return result.user, result.expiration

    def create_api_key(self, user_id: str, api_key: str, expiration: datetime) -> ApiKey:
        new_key = DBApiKey(user=user_id, api_key=api_key, expiration=expiration)
        self.db_session.add(new_key)
        self.db_session.commit()

        return ApiKey(api_key=api_key, expiration=expiration)

    def delete_api_key(self, user_id: str, api_key: str) -> bool:
        result = self._get_api_key_record(api_key)

        if result and result.user == user_id:
            self.db_session.delete(result)
            self.db_session.commit()

            return True 
    
        return False

    def get_api_keys(self, user_id: str) -> list[ApiKey]:
        keys = self._get_api_keys_for_user(user_id)
        return [ApiKey(api_key=key.api_key, expiration=key.expiration) for key in keys]
