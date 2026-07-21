import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { Platform } from "../data/platforms";
import type { HotSearchItem } from "../data/types";
import { PlatformIcon } from "./PlatformIcon";
import { RankBadge } from "./RankBadge";
import { HeatBadge } from "./HeatBadge";

interface Props {
  platform: Platform;
  items: HotSearchItem[];
  loading?: boolean;
  updatedAt?: string;
  onViewAll?: () => void;
}

export function PlatformCard({
  platform,
  items,
  loading = false,
  updatedAt,
  onViewAll,
}: Props) {
  const previewItems = items.slice(0, 5);
  const maxHot = items[0]?.hot ?? 0;

  return (
    <article className="group relative rounded-2xl border border-ink-100 bg-canvas overflow-hidden hover:border-ink-200 hover:shadow-hover transition-all duration-300">
      {/* Top color stripe */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${platform.color}, ${platform.color}AA)`,
        }}
      />

      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${platform.color}12`,
              color: platform.color,
            }}
          >
            <PlatformIcon id={platform.id} size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-ink-900 leading-tight">
              {platform.name}
            </h3>
            <p className="text-2xs text-ink-400 mt-0.5 truncate">
              {platform.description}
            </p>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="shrink-0 inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-2xs font-medium text-ink-400 hover:text-flame-600 hover:bg-flame-50 transition-colors"
            >
              全部
              <ChevronRight className="w-3 h-3" strokeWidth={2.4} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="mt-4 space-y-0.5">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-1.5">
                  <div className="skeleton-row w-5 h-5 rounded-md" />
                  <div className="flex-1">
                    <div className="skeleton-row h-2.5 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : previewItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-300">
              暂无数据
            </div>
          ) : (
            previewItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/item flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-ink-50 transition-colors"
              >
                <RankBadge rank={item.index} size="sm" />
                <span className="flex-1 truncate text-[13px] text-ink-700 group-hover/item:text-ink-900">
                  {item.title}
                </span>
                <HeatBadge
                  label={item.hotLabel}
                  hot={item.hot}
                  maxHot={maxHot}
                  showBar={false}
                />
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && previewItems.length > 0 && (
          <div className="mt-4 pt-3 border-t border-ink-50 flex items-center justify-between">
            <span className="text-2xs text-ink-400">
              共 <span className="text-ink-700 font-medium tabular-nums">{items.length}</span> 条
              {updatedAt && (
                <>
                  <span className="mx-1 text-ink-200">·</span>
                  <span className="tabular-nums">{formatTime(updatedAt)}</span>
                </>
              )}
            </span>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="inline-flex items-center gap-1 text-2xs font-medium text-ink-500 group-hover:text-flame-600 transition-colors"
              >
                查看热榜
                <ArrowUpRight className="w-3 h-3" strokeWidth={2.4} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function formatTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  return `${Math.floor(hr / 24)}天前`;
}
