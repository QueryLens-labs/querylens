from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    statement_timeout_ms: int

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            db_host=os.getenv("QUERYLENS_DB_HOST", "localhost"),
            db_port=int(os.getenv("QUERYLENS_DB_PORT", "5432")),
            db_name=os.getenv("QUERYLENS_DB_NAME", "querylens"),
            db_user=os.getenv("QUERYLENS_DB_USER", "querylens_readonly"),
            db_password=os.getenv("QUERYLENS_DB_PASSWORD", ""),
            statement_timeout_ms=int(
                os.getenv("QUERYLENS_STATEMENT_TIMEOUT_MS", "10000")
            ),
        )


settings = Settings.from_env()

