import type { Platform } from "../data/platforms";
import { PlatformIcon } from "./PlatformIcon";

interface Props {
  platforms: Platform[];
  current: Platform["id"];
  onChange: (id: Platform["id"]) => void;
  counts?: Partial<Record<Platform["id"], number>>;
}

export function PlatformTabs({ platforms, current, onChange, counts }: Props) {
  return (
    <div className="-mx-1 px-1 overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-min pb-1">
        {platforms.map((p) => {
          const active = p.id === current;
          const count = counts?.[p.id];
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className={`group relative inline-flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 ${
                active
                  ? "bg-canvas shadow-sm ring-1 ring-ink-100"
                  : "text-ink-500 hover:text-ink-900 hover:bg-canvas/60"
              }`}
              style={active ? { color: p.color } : undefined}
            >
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: active
                    ? `${p.color}15`
                    : `${p.color}08`,
                  color: active ? p.color : undefined,
                }}
              >
                <PlatformIcon id={p.id} size={16} />
              </span>
              <span className="text-[13px]">{p.shortName}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-2xs px-1.5 py-0.5 rounded-md tabular-nums ${
                    active
                      ? "text-canvas"
                      : "text-ink-400 bg-ink-50"
                  }`}
                  style={active ? { backgroundColor: p.color } : undefined}
                >
                  {count}
                </span>
              )}
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ backgroundColor: p.color }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
