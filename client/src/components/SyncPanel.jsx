import { useState } from "react";
import { syncToSheets } from "../lib/api";

export default function SyncPanel({ status, onSynced }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null); // { ok: bool, message: string }

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await syncToSheets();
      setResult({
        ok: true,
        message:
          res.synced_count > 0
            ? `Synced ${res.synced_count} row${res.synced_count === 1 ? "" : "s"}.`
            : "Already up to date.",
      });
      onSynced();
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setSyncing(false);
    }
  }

  if (!status) return null;

  return (
    <div className="border-t border-line mt-6 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted">
          {status.configured ? (
            status.unsynced_closed_count > 0 ? (
              <span>
                <span className="text-paper font-medium">
                  {status.unsynced_closed_count}
                </span>{" "}
                {status.unsynced_closed_count === 1 ? "entry" : "entries"} not
                yet in Sheets
              </span>
            ) : (
              <span>Sheets is up to date</span>
            )
          ) : (
            <span>
              Sheets sync isn't configured.
            </span>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || !status.configured}
          className="text-xs font-medium text-paper border border-line rounded-md px-3 py-1.5 hover:border-signal hover:text-signal transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-paper shrink-0"
        >
          {syncing ? "Syncing…" : "Sync to Sheets"}
        </button>
      </div>

      {result && (
        <p
          className={`text-xs mt-2 ${result.ok ? "text-done" : "text-signal"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
