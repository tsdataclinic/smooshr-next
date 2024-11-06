from datetime import datetime

from server.models.user.db_model import DBUser
from server.database import Base

from sqlalchemy import Uuid, ForeignKey, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

class DBApiKey(Base):
    """ApiKey table"""
    __tablename__ = "api_key"

    user: Mapped[str] = mapped_column(Uuid(as_uuid=False), ForeignKey(DBUser.id), nullable=False)
    api_key: Mapped[str] = mapped_column(String, nullable=False, primary_key=True)
    expiration: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class DBAzureApiKey(Base):
    """AzureApiKey table. Maps user ids to multiple Azure API key identifiers.
    The API keys themselves are not stored on the DB, but are stored in Azure Key Vault."""
    __tablename__ = "azure_api_key"

    user: Mapped[str] = mapped_column(Uuid(as_uuid=False), ForeignKey(DBUser.id), nullable=False)
    key_vault_identifier: Mapped[str] = mapped_column(String, nullable=False, primary_key=True)
