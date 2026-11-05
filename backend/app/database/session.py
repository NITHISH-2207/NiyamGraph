import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("niyamgraph.db")

# Load environment from root or backend directory
if os.path.exists("backend/.env"):
    load_dotenv("backend/.env")
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Normalize connection string for psycopg3 or psycopg2 if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

def initialize_engine(url: str):
    if not url or "username:password@host" in url:
        logger.warning("DATABASE_URL contains placeholder host or is empty. Falling back to local SQLite for development.")
        return create_engine("sqlite:///./niyamgraph.db", echo=False, connect_args={"check_same_thread": False})
    
    try:
        eng = create_engine(url, pool_pre_ping=True)
        # Test connection with a quick ping
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to PostgreSQL database.")
        return eng
    except Exception as exc:
        logger.warning(
            f"Unable to connect to primary PostgreSQL database ({exc}). "
            "Falling back to local SQLite (sqlite:///./niyamgraph.db) so services remain functional."
        )
        return create_engine("sqlite:///./niyamgraph.db", echo=False, connect_args={"check_same_thread": False})

engine = initialize_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
