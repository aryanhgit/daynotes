import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ActiveActivityCard from "./components/ActiveActivityCard";
import ActivityList from "./components/ActivityList";
import AddActivityModal from "./components/AddActivityModal";
import SyncPanel from "./components/SyncPanel";
import {
  listActivities,
  createActivity,
  closeActivity,
  getTodayTimeline,
  getSyncStatus,
} from "./lib/api";

export default function App() {
  const [activities, setActivities] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stopping, setStopping] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [activitiesData, timelineData, syncData] = await Promise.all([
        listActivities(),
        getTodayTimeline(),
        getSyncStatus(),
      ]);
      setActivities(activitiesData);
      setTimeline(timelineData);
      setSyncStatus(syncData);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const activeActivity = useMemo(
    () => activities.find((a) => !a.end_time) || null,
    [activities]
  );

  const knownNames = useMemo(() => {
    const names = new Set(activities.map((a) => a.name));
    return Array.from(names).sort();
  }, [activities]);

  async function handleStop() {
    if (!activeActivity) return;
    setStopping(true);
    try {
      await closeActivity(activeActivity.id);
      await refresh();
    } finally {
      setStopping(false);
    }
  }

  async function handleAddActivity({ name, startTime, durationMinutes }) {
    const created = await createActivity({ name, start_time: startTime });
    if (durationMinutes != null && durationMinutes > 0) {
      const endTime = new Date(
        new Date(startTime).getTime() + durationMinutes * 60000
      ).toISOString();
      await closeActivity(created.id, { end_time: endTime });
    }
    await refresh();
    setModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="max-w-xl mx-auto px-5 py-10">
        <Header />

        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
            Today
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm font-medium text-paper border border-line rounded-md px-3 py-1.5 hover:border-signal hover:text-signal transition-colors"
          >
            + Add activity
          </button>
        </div>
        <div className="h-5" />

        <ActiveActivityCard
          activity={activeActivity}
          onStop={handleStop}
          stopping={stopping}
        />

        {loadError && (
          <div className="border border-signal/40 bg-signal-dim/20 rounded-md px-4 py-3 mb-4 text-sm text-signal">
            Couldn't reach the backend ({loadError}). Is it running on{" "}
            <span className="font-display">:8000</span>?
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted text-center py-10">Loading…</p>
        ) : (
          <>
            <ActivityList timeline={timeline} />
            <SyncPanel status={syncStatus} onSynced={refresh} />
          </>
        )}
      </div>

      {modalOpen && (
        <AddActivityModal
          knownNames={knownNames}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddActivity}
        />
      )}
    </div>
  );
}
