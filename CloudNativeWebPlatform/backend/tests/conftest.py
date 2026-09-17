import os
import uuid

import pytest

# Point at the real local MySQL instance and clear any S3-endpoint override
# so moto (used in test_attachments.py) can intercept boto3 calls cleanly.
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "3306"
os.environ["DB_USER"] = "platform_user"
os.environ["DB_PASSWORD"] = "platform_pass"
os.environ["DB_NAME"] = "cloud_native_platform"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["S3_BUCKET"] = "test-bucket"
os.environ["S3_REGION"] = "us-east-1"
os.environ.pop("S3_ENDPOINT_URL", None)
os.environ.pop("S3_ACCESS_KEY", None)
os.environ.pop("S3_SECRET_KEY", None)
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.database import Base, engine  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _reset_schema():
    """Drops and recreates every table once per test run against the real
    MySQL instance, so tests start from a clean, known schema."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def unique_email():
    return f"user-{uuid.uuid4().hex[:8]}@test.com"
