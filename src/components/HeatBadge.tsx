import { Flame } from "lucide-react";

interface Props {
  label: string;
  hot: number;
  maxHot?: number;
  showBar?: boolean;
  color?: string;
}

function toPercent(hot: number, max?: number): number {
  if (!max || max <= 0) {
    // 没有参照时，按 1亿封顶做 log 缩放
    const v = Math.log10(Math.max(hot, 10)) / 8;
    return Math.min(100, Math.max(8, v * 100));
  }
  return Math.min(100, Math.max(8, (hot / max) * 100));
}

export function HeatBadge({ label, hot, maxHot, showBar = true, color }: Props) {
  const pct = toPercent(hot, maxHot);
  return (
    <div className="flex items-center gap-1.5 text-2xs font-medium text-ink-400">
      <Flame className="w-3 h-3 text-flame-500" strokeWidth={2.2} />
      <span className="tabular-nums">{label}</span>
      {showBar && (
        <span className="hidden sm:block h-1 w-12 rounded-full bg-ink-50 overflow-hidden">
          <span
            className="block h-full rounded-full heat-bar transition-all duration-500"
            style={{ width: `${pct}%`, ...(color ? { background: color } : null) }}
          />
        </span>
      )}
    </div>
  );
}
