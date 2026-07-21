import { useMemo } from "react";
import { ArrowRight, Flame, Layers, TrendingUp } from "lucide-react";
import { PLATFORMS } from "../data/platforms";
import type { PlatformId } from "../data/platforms";
import type { FetchResult } from "../data/types";
import { PlatformCard } from "../components/PlatformCard";
import { CardSkeleton } from "../components/Skeleton";
import { RankBadge } from "../components/RankBadge";
import { HeatBadge } from "../components/HeatBadge";
import { useRelativeTime } from "../hooks/useNow";

interface Props {
  results: Partial<Record<PlatformId, FetchResult>>;
  loading: boolean;
  onViewPlatform: (id: PlatformId) => void;
  onViewHot: () => void;
}

export function HomeView({
  results,
  loading,
  onViewPlatform,
  onViewHot,
}: Props) {
  const cards = PLATFORMS.map((p) => ({
    platform: p,
    result: results[p.id],
  }));

  const stats = useMemo(() => {
    const allItems = Object.values(results).flatMap(
      (r) => r?.data.items ?? []
    );
    const totalItems = allItems.length;
    const maxHot = allItems.reduce((m, x) => Math.max(m, x.hot), 0);
    const topPick = allItems
      .filter((x) => x.hot > 0)
      .sort((a, b) => b.hot - a.hot)
      .slice(0, 3);
    const platformsLoaded = Object.keys(results).length;
    const isLive = Object.values(results).some((r) => r?.source === "live");
    const latestUpdate = Object.values(results)
      .map((r) => (r ? new Date(r.data.updatedAt).getTime() : 0))
      .reduce((m, x) => Math.max(m, x), 0);
    return {
      totalItems,
      maxHot,
      topPick,
      platformsLoaded,
      isLive,
      latestUpdate: latestUpdate ? new Date(latestUpdate).toISOString() : null,
    };
  }, [results]);

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-8 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-700 to-flame-700 text-white mb-8">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-flame-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-ember-500/20 blur-3xl" />

        <div className="relative px-6 sm:px-10 py-10 sm:py-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-2xs font-medium ring-1 ring-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-weixin animate-pulse-dot" />
              {stats.isLive ? "实时数据" : "示例数据"} · 每分钟更新
            </span>
          </div>
          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight leading-tight">
            一站式热搜聚合
            <br />
            <span className="bg-gradient-to-r from-spark-400 via-ember-400 to-flame-400 bg-clip-text text-transparent">
              看见每个平台正在发生什么
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
            聚合微博、知乎、B站、抖音、快手、百度、头条等十大平台实时热榜。
            不切换 App，一屏看完今日所有热点。
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onViewHot}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-ink-900 text-sm font-semibold hover:bg-flame-50 transition-colors shadow-lg"
            >
              <Flame className="w-4 h-4 text-flame-600" fill="currentColor" />
              查看完整热榜
              <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
            </button>
            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-xl bg-white/5 backdrop-blur ring-1 ring-white/10">
              <Stat icon={<Layers className="w-3.5 h-3.5" />} value={PLATFORMS.length} label="平台" />
              <span className="w-px h-4 bg-white/15" />
              <Stat icon={<TrendingUp className="w-3.5 h-3.5" />} value={stats.totalItems} label="热点" />
              <span className="w-px h-4 bg-white/15" />
              <Stat icon={<Flame className="w-3.5 h-3.5" />} value={stats.maxHot > 0 ? formatHot(stats.maxHot) : "-"} label="峰值热度" raw />
            </div>
          </div>
        </div>
      </section>

      {/* Top picks */}
      {stats.topPick.length > 0 && (
        <section className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
                <span className="text-flame-500">
                  <Flame className="w-5 h-5" fill="currentColor" />
                </span>
                今日榜首
              </h2>
              <p className="text-xs text-ink-400 mt-1">全平台热度最高的三条热搜</p>
            </div>
            <button
              onClick={onViewHot}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-flame-600"
            >
              完整榜单 <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.topPick.map((item, idx) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-canvas border border-ink-100 p-5 hover:border-ink-200 hover:shadow-hover transition-all"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-flame-50 to-transparent opacity-60 group-hover:scale-125 transition-transform" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <RankBadge rank={idx + 1} size="lg" />
                    <HeatBadge label={item.hotLabel} hot={item.hot} showBar={false} />
                  </div>
                  <h3 className="text-[15px] font-medium text-ink-900 leading-snug line-clamp-2 group-hover:text-flame-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="text-2xs text-ink-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Platform cards */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">各平台热榜</h2>
            <p className="text-xs text-ink-400 mt-1">
              点击卡片查看完整热榜 · 共 {PLATFORMS.length} 个平台
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} rows={5} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(({ platform, result }) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                items={result?.data.items ?? []}
                loading={!result}
                updatedAt={result?.data.updatedAt}
                onViewAll={() => onViewPlatform(platform.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Latest update bar */}
      {stats.latestUpdate && (
        <UpdateBar iso={stats.latestUpdate} isLive={stats.isLive} />
      )}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  raw = false,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  raw?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-white/80">
      <span className="text-white/60">{icon}</span>
      <span className="text-sm font-semibold text-white tabular-nums">
        {raw ? value : typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="text-2xs text-white/60">{label}</span>
    </span>
  );
}

function UpdateBar({ iso, isLive }: { iso: string; isLive: boolean }) {
  const relative = useRelativeTime(iso);
  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-2xs text-ink-400">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isLive ? "bg-brand-weixin animate-pulse-dot" : "bg-ink-300"
        }`}
      />
      最后更新于 {relative}
    </div>
  );
}

function formatHot(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(2)}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return String(value);
}
