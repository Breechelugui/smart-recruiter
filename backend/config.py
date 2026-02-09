from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    codewars_base_url: str = "https://www.codewars.com/api/v1"
    codewars_api_key: str = ""
    frontend_url: str = "https://own-app-ten.vercel.app"
    email_sender: str = ""
    email_password: str = ""
    sendgrid_api_key: str = ""
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
