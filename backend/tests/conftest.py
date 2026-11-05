import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.database.session import Base, get_db
from app.main import app

TEST_DB_URL = os.getenv("TEST_DATABASE_URL")
PROD_DB_URL = os.getenv("DATABASE_URL")


@pytest.fixture(scope="session")
def check_safety_guards():
    """
    Strict safety guard enforcing Section 11:
    - Never run tests against production Neon.
    - Aborts if TEST_DATABASE_URL equals DATABASE_URL.
    - Aborts if TEST_DATABASE_URL does not contain test or dev markers.
    """
    if not TEST_DB_URL:
        pytest.skip(
            "TEST_DATABASE_URL is not configured. Safety guard prevented running tests against live/unverified database."
        )

    if PROD_DB_URL and TEST_DB_URL.strip() == PROD_DB_URL.strip():
        pytest.fail(
            "FATAL SAFETY VIOLATION: TEST_DATABASE_URL is identical to production DATABASE_URL! Test run aborted."
        )

    lower_url = TEST_DB_URL.lower()
    if not any(marker in lower_url for marker in ("test", "dev", "localhost", "127.0.0.1")):
        pytest.fail(
            "FATAL SAFETY VIOLATION: TEST_DATABASE_URL does not appear to be an isolated test/dev database! Aborting."
        )


@pytest.fixture(scope="session")
def test_engine(check_safety_guards):
    engine = create_engine(TEST_DB_URL, pool_pre_ping=True)
    # Build schema from metadata on isolated test DB
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(test_engine):
    """Per-test transaction rollback fixture."""
    connection = test_engine.connect()
    transaction = connection.begin()
    SessionTest = sessionmaker(bind=connection, autocommit=False, autoflush=False)
    session = SessionTest()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

