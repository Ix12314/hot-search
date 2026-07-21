import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock, Download, Search, Zap } from "lucide-react";
import { PLATFORMS, PLATFORM_MAP } from "../data/platforms";
import type { PlatformId } from "../data/platforms";
import { useHotSearch } from "../hooks/useHotSearch";
import { useRelativeTime } from "../hooks/useNow";
import { PlatformTabs } from "../components/PlatformTabs";
import { HotSearchRow } from "../components/HotSearchRow";
import { Skeleton } from "../components/Skeleton";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { PlatformIcon } from "../components/PlatformIcon";

interface Props {
  initialPlatform: PlatformId;
  onPlatformChange: (id: PlatformId) => void;
  onSourceChange: (s: "live" | "demo") => void;
}

export function HotSearchView({
  initialPlatform,
  onPlatformChange,
  onSourceChange,
}: Props) {
  const [platformId, setPlatformId] = useState<PlatformId>(initialPlatform);
  const [query, setQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { list, loading, refreshing, error, refresh, result } = useHotSearch(
    platformId,
    autoRefresh
  );

  const platform = PLATFORM_MAP[platformId];
  const relativeTime = useRelativeTime(list?.updatedAt ?? null);

  // notify parent of source changes
  useEffect(() => {
    if (result) onSourceChange(result.source);
  }, [result, onSourceChange]);

  const filtered = useMemo(() => {
    if (!list) return [];
    if (!query.trim()) return list.items;
    const q = query.trim().toLowerCase();
    return list.items.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        (x.desc ?? "").toLowerCase().includes(q)
    );
  }, [list, query]);

  const maxHot = list?.items[0]?.hot ?? 0;
  const counts = useMemo(() => {
    // only show count for current platform, others undefined to keep clean
    return { [platformId]: list?.items.length ?? 0 } as Partial<
      Record<PlatformId, number>
    >;
  }, [platformId, list]);

  const handlePlatformChange = (id: PlatformId) => {
    setPlatformId(id);
    onPlatformChange(id);
    setQuery("");
  };

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-2xs font-medium text-ink-400 mb-1">
            <span className="inline-flex items-center gap-1">
              <Zap className="w-3 h-3 text-flame-500" fill="currentColor" />
              实时热搜
            </span>
            <span className="text-ink-200">/</span>
            <span>{platform.shortName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
            >
              <PlatformIcon id={platform.id} size={20} />
            </span>
            {platform.name}
          </h1>
          <p className="text-sm text-ink-500 mt-1.5">
            {platform.description}
            {list && (
              <span className="ml-2 text-ink-400">
                · 共 <span className="text-ink-700 font-medium tabular-nums">{list.items.length}</span> 条
              </span>
            )}
          </p>
        </div>

        {/* Live + auto refresh */}
        <div className="flex items-center gap-2">
          {list && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas border border-ink-100 text-2xs font-medium text-ink-500">
              <Clock className="w-3 h-3" strokeWidth={2.2} />
              更新于 {relativeTime}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-2xs font-medium transition-colors ${
              autoRefresh
                ? "bg-flame-50 text-flame-600 ring-1 ring-flame-100"
                : "bg-canvas text-ink-500 border border-ink-100 hover:text-ink-900"
            }`}
            aria-pressed={autoRefresh}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? "bg-flame-500 animate-pulse-dot" : "bg-ink-300"
              }`}
            />
            {autoRefresh ? "自动刷新中" : "开启自动刷新"}
          </button>
        </div>
      </div>

      {/* Sticky tabs + search */}
      <div className="sticky top-16 z-30 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3 bg-canvas-panel/85 backdrop-blur-xl border-y border-ink-100 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 min-w-0">
            <PlatformTabs
              platforms={PLATFORMS}
              current={platformId}
              onChange={handlePlatformChange}
              counts={counts}
            />
          </div>
          <div className="lg:w-72 shrink-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300"
                strokeWidth={2.2}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索当前热榜..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-canvas border border-ink-100 placeholder:text-ink-300 focus:outline-none focus:border-flame-400 focus:ring-2 focus:ring-flame-100 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="rounded-2xl border border-ink-100 bg-canvas overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-700">
              {query ? `搜索结果 (${filtered.length})` : "完整热榜"}
            </h2>
            {refreshing && (
              <span className="inline-flex items-center gap-1 text-2xs text-flame-500">
                <Download className="w-3 h-3 animate-bounce" />
                同步中...
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-3">
              <Skeleton rows={8} />
            </div>
          ) : error ? (
            <ErrorState message="加载失败" onRetry={refresh} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={query ? "未找到相关热搜" : "暂无数据"}
              description={query ? "换个关键词试试吧" : undefined}
              onRetry={query ? undefined : refresh}
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {filtered.map((item) => (
                <HotSearchRow
                  key={item.id}
                  item={item}
                  maxHot={maxHot}
                  variant="detailed"
                  accent={platform.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side panel: top 3 spotlight + summary */}
        <aside className="hidden lg:block space-y-4">
          <div
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, ${platform.color}, ${platform.color}CC)`,
            }}
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="text-2xs font-medium opacity-80">本榜热度榜 TOP</span>
              <div className="mt-3 space-y-3">
                {(list?.items ?? []).slice(0, 3).map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-md bg-white/15 backdrop-blur flex items-center justify-center text-2xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-snug line-clamp-2 group-hover:underline">
                        {item.title}
                      </p>
                      <p className="text-2xs opacity-70 mt-1 tabular-nums">
                        {item.hotLabel}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="shrink-0 w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
                      strokeWidth={2.2}
                    />
                  </a>
                ))}
              </div>
              {result && (
                <p className="text-2xs opacity-70 mt-4 pt-4 border-t border-white/15">
                  数据来源：{list?.source ?? platform.shortName}
                  {result.source === "demo" && "（示例）"}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-canvas p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">
              热度分布
            </h3>
            <div className="space-y-2">
              {(list?.items ?? []).slice(0, 5).map((item) => {
                const pct = maxHot > 0 ? (item.hot / maxHot) * 100 : 0;
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-2xs text-ink-400 w-4 tabular-nums">
                      {item.index}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-ink-50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${platform.color}, ${platform.color}88)`,
                        }}
                      />
                    </div>
                    <span className="text-2xs text-ink-500 tabular-nums w-10 text-right">
                      {item.hotLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
