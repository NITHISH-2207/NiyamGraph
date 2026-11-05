import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment from root or backend directory
if os.path.exists("backend/.env"):
    load_dotenv("backend/.env")
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Support development fallback or engine creation
engine_args = {}
if DATABASE_URL.startswith("postgresql"):
    engine_args["pool_pre_ping"] = True

engine = create_engine(
    DATABASE_URL if DATABASE_URL else "sqlite:///:memory:",
    **engine_args
)

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
