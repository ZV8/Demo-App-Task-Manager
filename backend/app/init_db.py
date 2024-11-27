from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings
from models.models import Base

def init_db():
    engine = create_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully")
