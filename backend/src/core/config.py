import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://rohitkumar@localhost/bcg")
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")
        
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hhqwweyhuhhebibiyjb23983289u434bhj34u843")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

settings = Settings()