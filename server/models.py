from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    end_time = Column(DateTime(timezone=True), nullable=True)
    synced_to_sheets = Column(Boolean, nullable=False, default=False)
