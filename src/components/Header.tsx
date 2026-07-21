import { Flame, RefreshCw } from "lucide-react";
import { useNow } from "../hooks/useNow";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.17a10.93 10.93 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export type ViewKey = "home" | "hot" | "more";

interface Props {
  current: ViewKey;
  onChange: (view: ViewKey) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  liveStatus?: "live" | "demo";
}

const NAV_ITEMS: { key: ViewKey; label: string }[] = [
  { key: "home", label: "首页" },
  { key: "hot", label: "热搜" },
  { key: "more", label: "更多" },
];

export function Header({
  current,
  onChange,
  onRefresh,
  refreshing = false,
  liveStatus = "live",
}: Props) {
  const now = useNow();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-canvas/85 border-b border-ink-100">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-16 flex items-center gap-6">
        {/* Logo */}
        <button
          onClick={() => onChange("home")}
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="今日热榜"
        >
          <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-flame-500 to-ember-500 flex items-center justify-center shadow-sm">
            <Flame
              className="w-5 h-5 text-white"
              strokeWidth={2.4}
              fill="currentColor"
            />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-spark-400 animate-pulse-dot ring-2 ring-canvas" />
          </span>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink-900">
              今日热榜
            </span>
            <span className="text-2xs text-ink-400 mt-0.5">
              实时热搜聚合 · Hot Rank
            </span>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-ink-50 mx-auto sm:mx-0">
          {NAV_ITEMS.map((item) => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`relative px-4 sm:px-5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "text-canvas bg-canvas shadow-sm"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-lg ring-1 ring-ink-100" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto hidden md:flex items-center gap-4">
          {/* Live status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-50">
            <span
              className={`relative flex items-center justify-center w-1.5 h-1.5 ${
                liveStatus === "live" ? "text-brand-weixin" : "text-ink-300"
              }`}
            >
              <span
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  liveStatus === "live" ? "bg-brand-weixin" : "bg-ink-300"
                }`}
              />
              {liveStatus === "live" && (
                <span className="absolute w-1.5 h-1.5 rounded-full bg-brand-weixin animate-ping opacity-75" />
              )}
            </span>
            <span className="text-2xs font-medium text-ink-500">
              {liveStatus === "live" ? "实时" : "示例"}
            </span>
            <span className="w-px h-3 bg-ink-200" />
            <span className="text-2xs font-medium text-ink-700 tabular-nums">
              {now}
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:text-flame-600 hover:bg-flame-50 transition-colors disabled:opacity-50"
              aria-label="刷新"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                strokeWidth={2.2}
              />
              刷新
            </button>
          )}

          <a
            href="https://github.com/imsyy/DailyHotApi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="w-[18px] h-[18px]" />
          </a>
        </div>

        {/* Mobile refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-500 hover:text-flame-600 hover:bg-flame-50 transition-colors disabled:opacity-50"
            aria-label="刷新"
          >
            <RefreshCw
              className={`w-[18px] h-[18px] ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.2}
            />
          </button>
        )}
      </div>
    </header>
  );
}
