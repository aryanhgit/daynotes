from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Sequence

import server.models as models

MIN_GAP_SECONDS = 60


@dataclass
class Gap:
    start_time: datetime
    end_time: datetime

    @property
    def duration_seconds(self) -> float:
        return (self.end_time - self.start_time).total_seconds()


def compute_gaps(
    activities_sorted_by_start: Sequence["models.Activity"],
    min_gap_seconds: float = MIN_GAP_SECONDS,
) -> List[Optional[Gap]]:
    gaps: List[Optional[Gap]] = [None] * len(activities_sorted_by_start)

    for i in range(1, len(activities_sorted_by_start)):
        prev = activities_sorted_by_start[i - 1]
        current = activities_sorted_by_start[i]

        if prev.end_time is None:
            continue  # shouldn't happen given the caller's contract, but be safe

        gap_seconds = (current.start_time - prev.end_time).total_seconds()
        if gap_seconds >= min_gap_seconds:
            gaps[i] = Gap(start_time=prev.end_time, end_time=current.start_time) # type: ignore

    return gaps
