from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_type_id = Column(
        Integer,
        ForeignKey("activity_types.id"),
        nullable=False,
        index=True,
    )

    description = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    end_time = Column(DateTime(timezone=True), nullable=True)
    synced_to_sheets = Column(Boolean, nullable=False, default=False)
    activity_type = relationship("ActivityType", back_populates="activities")


class ActivityType(Base):
    __tablename__ = "activity_types"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    activities = relationship(
        "Activity",
        back_populates="activity_type",
    )