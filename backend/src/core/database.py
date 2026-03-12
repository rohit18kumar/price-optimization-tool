from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from core.config import settings

engine = create_async_engine(settings.ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    """Yield an async database connection using SQLAlchemy AsyncSession. Closes connection on exit."""
    async with AsyncSessionLocal() as session:
        yield session
