from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ActivityCreate(BaseModel):
    """Body for POST /activities."""

    name: str
    start_time: Optional[datetime] = None


class ActivityUpdate(BaseModel):
    """Body for PATCH /activities/{id} closes out an activity."""

    end_time: Optional[datetime] = None


class ActivityRead(BaseModel):
    """An activity as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
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
            name=activity.name,
            start_time=activity.start_time,
            end_time=activity.end_time,
            duration_seconds=duration,
            synced_to_sheets=bool(activity.synced_to_sheets),
        )

class SyncResult(BaseModel):
    """Response for POST /sync/sheets."""

    synced_count: int
    skipped_open_count: int
    activity_ids: list[int]


class SyncStatus(BaseModel):
    """Response for GET /sync/status."""

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
    """One row of either an activity or a gap, already in chronological 
    order with gaps threaded between the activities on either side of them."""

    kind: str  # "activity" | "gap"
    activity: Optional[ActivityRead] = None
    gap: Optional[GapRead] = None
