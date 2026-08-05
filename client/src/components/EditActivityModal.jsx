import { useEffect, useState } from "react";
import { listActivityTypes } from "../lib/api";

function toLocalInput(date) {
    const pad = (n) => String(n).padStart(2, "0");
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value) {
    return new Date(value).toISOString();
}

export default function EditActivityModal({ activity, onClose, onSave }) {
    const [activityTypes, setActivityTypes] = useState([]);
    const [name, setName] = useState(activity.name);
    const [end, setEnd] = useState(
        activity.end_time ? toLocalInput(new Date(activity.end_time)) : ""
    );

    useEffect(() => {
        listActivityTypes().then(setActivityTypes);
    }, []);

    function submit(e) {
        e.preventDefault();
        onSave(activity.id, {
            name,
            end_time: end ? fromLocalInput(end) : null,
        });
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={submit}
                className="bg-panel border border-line rounded-lg w-full max-w-sm p-5"
            >
                <h2 className="text-base font-semibold text-paper mb-4">
                    Edit activity
                </h2>

                <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">
                    Activity
                </label>
                <select
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-panel-raised border border-line rounded-md px-3 py-2 text-sm text-paper mb-4 focus:outline-none focus:ring-1 focus:ring-signal"
                    autoFocus
                >
                    <option value={activity.name}>{activity.name}</option>
                    {activityTypes
                        .filter((t) => t.name !== activity.name)
                        .map((t) => (
                            <option key={t.id} value={t.name}>
                                {t.name}
                            </option>
                        ))}
                </select>

                <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">
                    End time
                </label>
                <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full bg-panel-raised border border-line rounded-md px-3 py-2 text-sm font-display text-paper mb-1 focus:outline-none focus:ring-1 focus:ring-signal"
                />

                <p className="text-xs text-muted mb-4">
                    Leave blank to keep it running.
                </p>

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
                        className="text-sm font-medium bg-paper text-ink px-4 py-1.5 rounded-md hover:bg-white transition-colors"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
