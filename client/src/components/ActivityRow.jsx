import { formatClockTime, formatDuration } from "../lib/time";

export default function ActivityRow({ activity, onEditActivity }) {
  const isOpen = !activity.end_time;
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-1">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOpen ? "bg-signal" : "bg-done"
            }`}
        />
        <div className="min-w-0">
          <p className="text-sm text-paper truncate">{activity.name}</p>
          <p className="font-display text-xs text-muted tabular">
            {formatClockTime(activity.start_time)}
            {" to "}
            {activity.end_time ? formatClockTime(activity.end_time) : "now"}
          </p>
        </div>
      </div>
      <div className="font-display tabular text-sm text-muted shrink-0">
        {activity.duration_seconds != null
          ? formatDuration(activity.duration_seconds)
          : "\u2014"}
      </div>
      <button
        onClick={() => onEditActivity(activity)}
        className="text-xs text-muted hover:text-ink px-2 py-1.5"
      >
        Edit
      </button>
    </div>
  );
}
