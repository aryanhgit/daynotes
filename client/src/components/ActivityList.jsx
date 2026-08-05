import ActivityRow from "./ActivityRow";
import GapRow from "./GapRow";

export default function ActivityList({ timeline, onEditActivity }) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted">No activity logged today yet.</p>
      </div>
    );
  }

  async function handleEdit(id, changes) {
    await editActivity(id, changes);
    setEditingActivity(null);
    refresh();
  }

  return (
    <div className="divide-y divide-line">
      {timeline.map((entry, i) =>
        entry.kind === "activity" ? (
          <ActivityRow key={entry.activity.id} activity={entry.activity} onEditActivity={onEditActivity}
          />
        ) : (
          <GapRow key={`gap-${i}`} gap={entry.gap} />
        )
      )}
    </div>
  );
}
