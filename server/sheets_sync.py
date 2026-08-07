from typing import Iterable

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from config import settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

_service = None


class SheetsSyncError(RuntimeError):
    """Raised for any configuration or API problem talking to Sheets."""

def get_sheets_service():
    global _service
    if _service is not None:
        return _service

    if not settings.google_sheet_id:
        raise SheetsSyncError("GOOGLE_SHEET_ID is not set.")
    try:
        credentials = service_account.Credentials.from_service_account_file(
            settings.google_service_account_file, scopes=SCOPES
        )
    except FileNotFoundError:
        raise SheetsSyncError(
            f"Service account key not found at "
            f"'{settings.google_service_account_file}'. Download it from "
            f"Google Cloud Console."
        )
    except (ValueError, KeyError) as e:
        raise SheetsSyncError(
            f"'{settings.google_service_account_file}' isn't a valid service "
            f"account key ({e}). Re-download it from Google Cloud Console."
        )

    _service = build("sheets", "v4", credentials=credentials)
    return _service


def activity_to_row(activity) -> list:
    """[date, activity, start, end, duration]"""
    duration_seconds = (activity.end_time - activity.start_time).total_seconds()
    hours = duration_seconds / 3600

    return [
        activity.start_time.date().isoformat(),
        activity.name,
        activity.start_time.isoformat(timespec="minutes"),
        activity.end_time.isoformat(timespec="minutes"),
        round(hours, 2),
    ]


def gap_to_row(gap) -> list:
    hours = gap.duration_seconds / 3600
    return [
        gap.start_time.date().isoformat(),
        "Untracked",
        gap.start_time.isoformat(timespec="minutes"),
        gap.end_time.isoformat(timespec="minutes"),
        round(hours, 2),
    ]


def append_rows(rows: Iterable[list]) -> int:
    """Append pre-built rows to the configured Sheet. Returns rows written."""
    rows = list(rows)
    if not rows:
        return 0

    service = get_sheets_service()
    try:
        service.spreadsheets().values().append(
            spreadsheetId=settings.google_sheet_id,
            range=settings.google_sheet_range,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body={"values": rows},
        ).execute()
    except HttpError as e:
        raise SheetsSyncError(f"Google Sheets API error: {e}") from e
    except Exception as e:
        raise SheetsSyncError(f"Couldn't reach Google Sheets: {e}") from e

    return len(rows)
