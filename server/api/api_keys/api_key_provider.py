from abc import ABC, abstractmethod
from typing import Optional, Tuple
from datetime import datetime

from server.models.apikey.api_schemas import ApiKey

class ApiKeyProvider(ABC):
    @abstractmethod
    def get_user_and_expiration(self, api_key: str) -> Optional[Tuple[str, datetime]]:
        """
        Retreieve the user ID and expiration date for a given API key, if it is valid.
        Validity of an API key requires that it exists in the db and is not expired.

        Args:
            api_key (str): The API key to check.

        Returns:
            Optional[Tuple[str, dateime]]: The user ID and expiration date if found.
        """
        pass

    @abstractmethod
    def create_api_key(self, user_id: str, api_key: str, expiration: datetime) -> ApiKey:
        """
        Create an API key associated with the user_id, and with the given expiration date (in UTC).  

        Args:
            user_id (str): The ID of the user.
            api_key (str): The API key to associate with the user.
            expiration (datetime): The expiration date of the API key in UTC.

        Returns:
            None
        """
        pass

    @abstractmethod
    def delete_api_key(self, user_id: str, api_key: str) -> bool:
        """
        Delete the specified API key for a given user ID, but only if the API key belongs to the user.

        Args:
            user_id (str): The ID of the user.
            api_key (str): The API key to be deleted.

        Returns:
            None
        """
        pass

    @abstractmethod
    def get_api_keys(self, user_id: str) -> list[ApiKey]:
        """
        Retrieve all API keys associated with the given user ID.

        Args:
            user_id (str): The ID of the user.

        Returns:
            list[ApiKey]: A list of ApiKey objects associated with the user.
        """
        pass