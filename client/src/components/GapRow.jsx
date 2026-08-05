import { formatClockTime, formatDuration } from "../lib/time";

export default function GapRow({ gap }) {
  return (
    <div className="hatch-bg rounded-md flex items-center justify-between gap-4 py-2.5 px-3 my-1">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Untracked</p>
        <p className="font-display text-xs text-muted/80 tabular">
          {formatClockTime(gap.start_time)}
          {" \u2192 "}
          {formatClockTime(gap.end_time)}
        </p>
      </div>
      <div className="font-display tabular text-xs text-muted">
        {formatDuration(gap.duration_seconds)}
      </div>
    </div>
  );
}
