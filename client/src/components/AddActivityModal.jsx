import { useEffect, useRef, useState } from "react";

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AddActivityModal({ knownNames, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState(toLocalInputValue(new Date()));
  const [durationMinutes, setDurationMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the activity a name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        startTime: new Date(startTime).toISOString(),
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-panel border border-line rounded-lg w-full max-w-sm p-5"
      >
        <h2 className="text-base font-semibold text-paper mb-4">
          Add activity
        </h2>

        <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">
          Activity
        </label>
        <input
          ref={nameInputRef}
          list="known-activity-names"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Deep work, Email, Standup…"
          className="w-full bg-panel-raised border border-line rounded-md px-3 py-2 text-sm text-paper placeholder:text-muted/70 mb-4 focus:outline-none focus:ring-1 focus:ring-signal"
        />
        <datalist id="known-activity-names">
          {knownNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>

        <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">
          Start time
        </label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full bg-panel-raised border border-line rounded-md px-3 py-2 text-sm font-display text-paper mb-4 focus:outline-none focus:ring-1 focus:ring-signal"
        />

        <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">
          Duration (minutes, optional)
        </label>
        <input
          type="number"
          min="0"
          step="1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="Leave blank to keep it running"
          className="w-full bg-panel-raised border border-line rounded-md px-3 py-2 text-sm font-display text-paper placeholder:text-muted/70 mb-1 focus:outline-none focus:ring-1 focus:ring-signal"
        />
        <p className="text-xs text-muted mb-4">
          If set, the activity is logged as already finished.
        </p>

        {error && <p className="text-xs text-signal mb-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted px-3 py-1.5 rounded-md hover:text-paper transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-medium bg-paper text-ink px-4 py-1.5 rounded-md hover:bg-white transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Start"}
          </button>
        </div>
      </form>
    </div>
  );
}
