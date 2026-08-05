from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from database import Base, engine, get_db, run_lightweight_migrations
import models
import schemas
import config
import sheets_sync
import gaps

Base.metadata.create_all(bind=engine)
run_lightweight_migrations()

app = FastAPI(title="daynotes api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/activities", response_model=schemas.ActivityRead, status_code=201)
def create_activity(payload: schemas.ActivityCreate, db: Session = Depends(get_db)):
    """Start a new activity. start time defaults to now if not given."""

    activity = models.Activity(
        activity_type_id=payload.activity_type_id,
        description=payload.description,
        start_time=payload.start_time or datetime.now(timezone.utc),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return schemas.ActivityRead.from_orm_with_duration(activity)


@app.patch("/api/activities/{activity_id}", response_model=schemas.ActivityRead)
def update_activity(
    activity_id: int,
    payload: schemas.ActivityUpdate,
    db: Session = Depends(get_db),
):
    """Close out an activity by setting its end time (defaults to now)."""

    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    if payload.activity_type_id is not None:
        activity.activity_type_id = payload.activity_type_id # type: ignore

    if payload.description is not None:
        activity.description = payload.description # type: ignore

    if payload.end_time is not None:
        activity.end_time = payload.end_time # type: ignore
    
    db.commit()
    db.refresh(activity)
    return schemas.ActivityRead.from_orm_with_duration(activity)


@app.get("/api/activities", response_model=List[schemas.ActivityRead])
def list_activities(db: Session = Depends(get_db)):
    """List all activities, most recent first."""

    activities = (
        db.query(models.Activity).options(joinedload(models.Activity.activity_type))
        .order_by(desc(models.Activity.start_time)).all()
    )
    return [schemas.ActivityRead.from_orm_with_duration(a) for a in activities]



@app.get("/api/timeline/today", response_model=List[schemas.TimelineEntry])
def timeline_today(db: Session = Depends(get_db)):
    today = datetime.now(timezone.utc).date()

    todays_activities = (
        db.query(models.Activity)
        .options(joinedload(models.Activity.activity_type))
        .filter(
            models.Activity.start_time >= datetime(
                today.year, today.month, today.day, tzinfo=timezone.utc
            )
        )
        .order_by(models.Activity.start_time)
        .all()
    )

    gaps_before = gaps.compute_gaps(todays_activities)
    gap_by_activity_id = {
        todays_activities[i].id: gap
        for i, gap in enumerate(gaps_before)
        if gap is not None
    }

    timeline: List[schemas.TimelineEntry] = []
    for activity in todays_activities:
        gap = gap_by_activity_id.get(activity.id)
        if gap is not None:
            timeline.append(
                schemas.TimelineEntry(
                    kind="gap",
                    gap=schemas.GapRead(
                        start_time=gap.start_time,
                        end_time=gap.end_time,
                        duration_seconds=gap.duration_seconds,
                    ),
                )
            )
        timeline.append(
            schemas.TimelineEntry(
                kind="activity",
                activity=schemas.ActivityRead.from_orm_with_duration(activity),
            )
        )
    return timeline



@app.get("/api/sync/status", response_model=schemas.SyncStatus)
def sync_status(db: Session = Depends(get_db)):
    """Check sync configuration and backlog."""
    unsynced_count = (
        db.query(models.Activity)
        .filter(
            models.Activity.end_time.isnot(None),
            models.Activity.synced_to_sheets.is_(False),
        )
        .count()
    )
    return schemas.SyncStatus(
        configured=config.sheets_configured(),
        unsynced_closed_count=unsynced_count,
        sheet_id=config.GOOGLE_SHEET_ID,
        sheet_range=config.GOOGLE_SHEET_RANGE,
    )


@app.post("/api/sync/sheets", response_model=schemas.SyncResult)
def sync_sheets(db: Session = Depends(get_db)):
    all_closed = (
        db.query(models.Activity)
        .options(joinedload(models.Activity.activity_type))
        .filter(models.Activity.end_time.isnot(None))
        .order_by(models.Activity.start_time)
        .all()
    )

    pending_ids = {a.id for a in all_closed if not a.synced_to_sheets} # type: ignore
    still_open_count = (
        db.query(models.Activity)
        .filter(models.Activity.end_time.is_(None))
        .count()
    )

    if not pending_ids:
        return schemas.SyncResult(
            synced_count=0,
            skipped_open_count=still_open_count,
            activity_ids=[],
        )

    gaps_before = gaps.compute_gaps(all_closed)

    rows = []
    synced_activities = []
    for activity, gap in zip(all_closed, gaps_before):
        if activity.id not in pending_ids:
            continue
        if gap is not None:
            rows.append(sheets_sync.gap_to_row(gap))
        rows.append(sheets_sync.activity_to_row(activity))
        synced_activities.append(activity)

    try:
        sheets_sync.append_rows(rows)
    except sheets_sync.SheetsSyncError as e:
        raise HTTPException(status_code=502, detail=str(e))

    for activity in synced_activities:
        activity.synced_to_sheets = True
    db.commit()

    return schemas.SyncResult(
        synced_count=len(synced_activities),
        skipped_open_count=still_open_count,
        activity_ids=[a.id for a in synced_activities],
    )

@app.get("/api/activity-types", response_model=list[schemas.ActivityTypeOut])
def list_activity_types(db: Session = Depends(get_db)):
    return db.query(models.ActivityType).order_by(models.ActivityType.name).all()


@app.post("/api/activity-types", response_model=schemas.ActivityTypeOut, status_code=201)
def create_activity_type(payload: schemas.ActivityTypeCreate, db: Session = Depends(get_db)):
    existing = db.query(models.ActivityType).filter_by(name=payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Activity type already exists")

    activity_type = models.ActivityType(name=payload.name)
    db.add(activity_type)
    db.commit()
    db.refresh(activity_type)
    return activity_type