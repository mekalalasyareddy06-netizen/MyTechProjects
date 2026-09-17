import os


class Settings:
    """Central place for every environment-driven setting.

    Reading os.environ directly (with sane local-dev defaults) keeps this
    dependency-free and easy to override per environment: local Docker
    Compose, a Kubernetes ConfigMap/Secret, or a plain EC2 instance with a
    systemd unit setting these as env vars.
    """

    # MySQL
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "platform_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "platform_pass")
    DB_NAME: str = os.getenv("DB_NAME", "cloud_native_platform")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

    # S3 (or an S3-compatible endpoint like MinIO for local dev)
    S3_BUCKET: str = os.getenv("S3_BUCKET", "cloud-native-platform-attachments")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    S3_ENDPOINT_URL: str | None = os.getenv("S3_ENDPOINT_URL") or None
    S3_ACCESS_KEY: str | None = os.getenv("S3_ACCESS_KEY")
    S3_SECRET_KEY: str | None = os.getenv("S3_SECRET_KEY")

    # CORS
    CLIENT_ORIGIN: str = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")


settings = Settings()
