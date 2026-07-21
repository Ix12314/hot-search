import { useMemo } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Hash,
  Info,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  PLATFORMS,
  PLATFORM_CATEGORY_LABEL,
} from "../data/platforms";
import type { Platform, PlatformId } from "../data/platforms";
import type { FetchResult } from "../data/types";
import { PlatformIcon } from "../components/PlatformIcon";

interface Props {
  results: Partial<Record<PlatformId, FetchResult>>;
  onOpenPlatform: (id: PlatformId) => void;
  onRefreshAll: () => void;
  refreshing?: boolean;
}

export function MoreView({
  results,
  onOpenPlatform,
  onRefreshAll,
  refreshing,
}: Props) {
  const grouped = useMemo(() => {
    const map = new Map<Platform["category"], Platform[]>();
    for (const p of PLATFORMS) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return Array.from(map.entries());
  }, []);

  const totals = useMemo(() => {
    const all = Object.values(results).flatMap((r) => r?.data.items ?? []);
    const sum = all.reduce((s, x) => s + x.hot, 0);
    const max = all.reduce((m, x) => Math.max(m, x.hot), 0);
    return {
      items: all.length,
      sum,
      max,
      platformsLoaded: Object.keys(results).length,
      isLive: Object.values(results).some((r) => r?.source === "live"),
    };
  }, [results]);

  const perPlatformCounts = useMemo(() => {
    return PLATFORMS.map((p) => ({
      platform: p,
      count: results[p.id]?.data.items.length ?? 0,
      maxHot: results[p.id]?.data.items.reduce(
        (m, x) => Math.max(m, x.hot),
        0
      ) ?? 0,
    }));
  }, [results]);

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-8 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-2xs font-medium text-ink-400 mb-1">
            <Layers className="w-3 h-3" />
            平台总览
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            更多平台 · 统计与关于
          </h1>
          <p className="text-sm text-ink-500 mt-1.5">
            共接入 {PLATFORMS.length} 个平台，覆盖社交、视频、搜索、社区与直播五大场景
          </p>
        </div>
        <button
          onClick={onRefreshAll}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-canvas bg-ink-900 hover:bg-ink-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.2} />
          {refreshing ? "刷新中..." : "刷新全部"}
        </button>
      </div>

      {/* Stats grid */}
      <section className="mb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="接入平台"
            value={PLATFORMS.length.toString()}
            sub="个"
            icon={<Layers className="w-5 h-5" />}
            accent="text-brand-zhihu"
            tint="bg-brand-zhihu/10"
          />
          <StatCard
            label="热搜条目"
            value={totals.items.toLocaleString()}
            sub="条"
            icon={<Hash className="w-5 h-5" />}
            accent="text-flame-600"
            tint="bg-flame-50"
          />
          <StatCard
            label="累计热度"
            value={formatHot(totals.sum)}
            sub=""
            icon={<BarChart3 className="w-5 h-5" />}
            accent="text-ember-600"
            tint="bg-ember-500/10"
          />
          <StatCard
            label="峰值热度"
            value={totals.max > 0 ? formatHot(totals.max) : "-"}
            sub=""
            icon={<Info className="w-5 h-5" />}
            accent="text-spark-500"
            tint="bg-spark-400/10"
          />
        </div>
      </section>

      {/* Platform distribution chart */}
      <section className="mb-10">
        <div className="rounded-2xl border border-ink-100 bg-canvas p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-ink-900">
                各平台热度分布
              </h2>
              <p className="text-2xs text-ink-400 mt-0.5">
                基于当前榜单最高热度对比
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {perPlatformCounts
              .slice()
              .sort((a, b) => b.maxHot - a.maxHot)
              .map(({ platform, count, maxHot }) => {
                const pct =
                  totals.max > 0 ? (maxHot / totals.max) * 100 : 0;
                return (
                  <button
                    key={platform.id}
                    onClick={() => onOpenPlatform(platform.id)}
                    className="group w-full flex items-center gap-3 py-1.5 hover:bg-ink-50/60 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${platform.color}15`,
                        color: platform.color,
                      }}
                    >
                      <PlatformIcon id={platform.id} size={16} />
                    </span>
                    <span className="text-sm text-ink-700 w-16 text-left shrink-0">
                      {platform.shortName}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-ink-50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          background: `linear-gradient(90deg, ${platform.color}, ${platform.color}88)`,
                        }}
                      />
                    </div>
                    <span className="text-2xs text-ink-400 w-14 text-right tabular-nums shrink-0">
                      {count > 0 ? `${count}条` : "—"}
                    </span>
                    <span className="text-2xs text-ink-500 w-12 text-right tabular-nums shrink-0">
                      {maxHot > 0 ? formatHot(maxHot) : "—"}
                    </span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-ink-300 group-hover:text-flame-500 transition-colors shrink-0"
                      strokeWidth={2.2}
                    />
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* All platforms grouped by category */}
      <section className="space-y-8">
        {grouped.map(([category, platforms]) => (
          <div key={category}>
            <h2 className="text-base font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <span className="inline-block w-1 h-4 rounded-full bg-flame-500" />
              {PLATFORM_CATEGORY_LABEL[category]}
              <span className="text-2xs font-normal text-ink-400">
                · {platforms.length}个平台
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((p) => {
                const result = results[p.id];
                const top = result?.data.items[0];
                return (
                  <button
                    key={p.id}
                    onClick={() => onOpenPlatform(p.id)}
                    className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-canvas p-4 text-left hover:border-ink-200 hover:shadow-hover transition-all"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex items-start gap-3">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${p.color}15`,
                          color: p.color,
                        }}
                      >
                        <PlatformIcon id={p.id} size={22} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-ink-900">
                          {p.name}
                        </h3>
                        <p className="text-2xs text-ink-400 mt-0.5 line-clamp-1">
                          {p.description}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="w-4 h-4 text-ink-300 group-hover:text-flame-500 transition-colors shrink-0"
                        strokeWidth={2.2}
                      />
                    </div>
                    {top && (
                      <div className="mt-3 pt-3 border-t border-ink-50">
                        <p className="text-2xs text-ink-400 mb-1">当前榜首</p>
                        <p className="text-[13px] text-ink-700 line-clamp-1">
                          {top.title}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="mt-12">
        <div className="rounded-2xl bg-ink-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-flame-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-lg font-semibold mb-3">关于今日热榜</h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
              本站聚合微博、知乎、B站、抖音、快手、百度、头条、网易、斗鱼、贴吧等
              10 个主流平台的实时热榜数据。所有数据来自公开 API 接口，每分钟自动同步一次，
              便于一站速览全网热点。
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-2xs text-white/60">
              <span className="px-2.5 py-1 rounded-md bg-white/5 ring-1 ring-white/10">
                数据源：DailyHotApi
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 ring-1 ring-white/10">
                刷新频率：60s
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 ring-1 ring-white/10">
                框架：React + Vite + Tailwind
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 ring-1 ring-white/10">
                {totals.isLive ? "数据状态：实时" : "数据状态：示例"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  tint,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-canvas p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xs text-ink-400">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tint} ${accent}`}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-bold text-ink-900 tabular-nums">
          {value}
        </span>
        {sub && <span className="text-xs text-ink-400">{sub}</span>}
      </div>
    </div>
  );
}

function formatHot(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(2)}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return String(value);
}
