import { useEffect, useState } from "react";
import { formatClockTime, formatDuration } from "../lib/time";

export default function ActiveActivityCard({ activity, onStop, stopping }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!activity) {
    return (
      <div className="border border-dashed border-line rounded-lg px-5 py-6 mb-6 text-center">
        <p className="text-sm text-muted">
          Nothing punched in. Start an activity to begin tracking.
        </p>
      </div>
    );
  }

  const elapsedSeconds = (now - new Date(activity.start_time)) / 1000;

  return (
    <div className="relative border border-signal/40 bg-signal-dim/20 rounded-lg px-5 py-5 mb-6 overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal pulse-dot shrink-0" />
            <span className="text-xs uppercase tracking-widest text-signal font-medium">
              Recording
            </span>
          </div>
          <p className="text-lg font-semibold text-paper truncate">
            {activity.name}
          </p>
          <p className="text-xs text-muted mt-0.5">
            since {formatClockTime(activity.start_time)}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="font-display tabular text-3xl text-paper leading-none">
            {formatDuration(elapsedSeconds)}
          </div>
          <button
            onClick={onStop}
            disabled={stopping}
            className="mt-3 text-sm font-medium bg-paper text-ink px-4 py-1.5 rounded-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stopping ? "Stopping…" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
