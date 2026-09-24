import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import settings

logger = logging.getLogger("smart_food.database")

db_url = settings.DATABASE_URL

# Connect arguments
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    if db_url.startswith("mysql"):
        # Test connection or configure with pool pre-ping
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info("Successfully connected to MySQL database.")
    else:
        engine = create_engine(db_url, connect_args=connect_args)
        logger.info(f"Using SQLite database: {db_url}")
except Exception as e:
    logger.warning(
        f"Could not connect to configured database at '{db_url}': {e}. "
        "Falling back gracefully to local SQLite database (sqlite:///./smart_food.db) "
        "so the platform runs out-of-the-box."
    )
    fallback_url = "sqlite:///./smart_food.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
