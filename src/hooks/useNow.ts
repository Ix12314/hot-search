import { useEffect, useState } from "react";

function format(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function useNow(intervalMs = 1000): string {
  const [now, setNow] = useState(() => format(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setNow(format(new Date())), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function useRelativeTime(iso: string | null): string {
  const [label, setLabel] = useState("刚刚");
  useEffect(() => {
    if (!iso) {
      setLabel("刚刚");
      return;
    }
    const tick = () => {
      const t = new Date(iso).getTime();
      const diff = Date.now() - t;
      if (Number.isNaN(diff)) {
        setLabel("刚刚");
        return;
      }
      const sec = Math.floor(diff / 1000);
      if (sec < 60) setLabel(`${sec}秒前`);
      else if (sec < 3600) setLabel(`${Math.floor(sec / 60)}分钟前`);
      else if (sec < 86400) setLabel(`${Math.floor(sec / 3600)}小时前`);
      else setLabel(`${Math.floor(sec / 86400)}天前`);
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [iso]);
  return label;
}
