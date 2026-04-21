from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="StockFlow", alias="app_name")
    database_url: str = Field(alias="database_url")
    secret_key: str = Field(alias="secret_key")
    algorithm: str = Field(default="HS256", alias="algorithm")
    access_token_expire_minutes: int = Field(default=60, alias="access_token_expire_minutes")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
