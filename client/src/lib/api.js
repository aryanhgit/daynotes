const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function listActivities() {
  return request("/api/activities");
}

export function createActivity({ name, start_time }) {
  return request("/api/activities", {
    method: "POST",
    body: JSON.stringify({ name, start_time: start_time || undefined }),
  });
}

export function closeActivity(id, { end_time } = {}) {
  return request(`/api/activities/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ end_time: end_time || undefined }),
  });
}

export function getTodayTimeline() {
  return request("/api/timeline/today");
}

export function getSyncStatus() {
  return request("/api/sync/status");
}

export function syncToSheets() {
  return request("/api/sync/sheets", { method: "POST" });
}
