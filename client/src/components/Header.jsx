import { useEffect, useState } from "react";

export default function Header() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateLabel = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeLabel = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="flex items-baseline justify-between border-b border-line pb-5 mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-paper">
          Day Notes
        </h1>
        <p className="text-sm text-muted mt-1">{dateLabel}</p>
      </div>
      <div className="font-display tabular text-lg text-muted">{timeLabel}</div>
    </header>
  );
}
