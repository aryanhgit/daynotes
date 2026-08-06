import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    database_url: str
    allowed_origins: list[str]

    google_service_account_file: str
    google_sheet_id: str | None
    google_sheet_range: str

    def sheets_configured(self) -> bool:
        return (
            self.google_sheet_id is not None
            and os.path.exists(self.google_service_account_file)
        )


settings = Settings(
    database_url=os.getenv("DATABASE_URL", "sqlite:///app.db"),
    allowed_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000",).split(","),

    google_service_account_file=os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "service-account.json",),
    google_sheet_id=os.getenv("GOOGLE_SHEET_ID"),
    google_sheet_range=os.getenv("GOOGLE_SHEET_RANGE","Sheet1!A:E",),
)