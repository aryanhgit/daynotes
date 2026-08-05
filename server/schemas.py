from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ActivityCreate(BaseModel):
    activity_type_id: int
    description: Optional[str] = None
    start_time: Optional[datetime] = None

class ActivityUpdate(BaseModel):
    activity_type_id: Optional[int] = None
    description: Optional[str] = None
    end_time: Optional[datetime] = None

class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activity_type_id: int
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    synced_to_sheets: bool = False

    @staticmethod
    def from_orm_with_duration(activity) -> "ActivityRead":
        duration = None
        if activity.end_time is not None:
            duration = (activity.end_time - activity.start_time).total_seconds()
        return ActivityRead(
            id=activity.id,
            activity_type_id=activity.activity_type_id,
            name=activity.activity_type.name,
            description=activity.description,
            start_time=activity.start_time,
            end_time=activity.end_time,
            duration_seconds=duration,
            synced_to_sheets=bool(activity.synced_to_sheets),
        )

class SyncResult(BaseModel):
    """Response for POST /api/sync/sheets."""

    synced_count: int
    skipped_open_count: int
    activity_ids: list[int]


class SyncStatus(BaseModel):
    """Response for GET /api/sync/status."""

    configured: bool
    unsynced_closed_count: int
    sheet_id: Optional[str] = None
    sheet_range: Optional[str] = None


class GapRead(BaseModel):
    """A computed, never-stored 'Untracked' gap between two activities."""

    kind: str = "gap"
    start_time: datetime
    end_time: datetime
    duration_seconds: float


class TimelineEntry(BaseModel):
    """One row of GET /api/timeline/today."""

    kind: str  # "activity" | "gap"
    activity: Optional[ActivityRead] = None
    gap: Optional[GapRead] = None


class ActivityTypeCreate(BaseModel):
    name: str


class ActivityTypeOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True