import ActivityRow from "./ActivityRow";
import GapRow from "./GapRow";

export default function ActivityList({ timeline }) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted">No activity logged today yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      {timeline.map((entry, i) =>
        entry.kind === "activity" ? (
          <ActivityRow key={entry.activity.id} activity={entry.activity} />
        ) : (
          <GapRow key={`gap-${i}`} gap={entry.gap} />
        )
      )}
    </div>
  );
}
