import uuid

import boto3
from botocore.exceptions import ClientError

from .config import settings


def _client():
    """Builds a boto3 S3 client.

    S3_ENDPOINT_URL is left unset in production so boto3 talks to real AWS
    S3. For local development it points at a MinIO container (see
    docker-compose.yml), which speaks the same S3 API — so this same code
    path is exercised in dev, in tests (via moto), and in production.
    """
    kwargs = {"region_name": settings.S3_REGION}
    if settings.S3_ENDPOINT_URL:
        kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL
    if settings.S3_ACCESS_KEY and settings.S3_SECRET_KEY:
        kwargs["aws_access_key_id"] = settings.S3_ACCESS_KEY
        kwargs["aws_secret_access_key"] = settings.S3_SECRET_KEY
    return boto3.client("s3", **kwargs)


def ensure_bucket_exists() -> None:
    client = _client()
    try:
        client.head_bucket(Bucket=settings.S3_BUCKET)
    except ClientError:
        create_kwargs = {"Bucket": settings.S3_BUCKET}
        if settings.S3_REGION != "us-east-1":
            create_kwargs["CreateBucketConfiguration"] = {"LocationConstraint": settings.S3_REGION}
        client.create_bucket(**create_kwargs)


def build_object_key(task_id: int, filename: str) -> str:
    return f"tasks/{task_id}/{uuid.uuid4().hex}-{filename}"


def upload_fileobj(fileobj, key: str, content_type: str) -> None:
    client = _client()
    client.upload_fileobj(
        fileobj, settings.S3_BUCKET, key, ExtraArgs={"ContentType": content_type}
    )


def generate_download_url(key: str, expires_in: int = 3600) -> str:
    client = _client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )


def delete_object(key: str) -> None:
    client = _client()
    client.delete_object(Bucket=settings.S3_BUCKET, Key=key)
