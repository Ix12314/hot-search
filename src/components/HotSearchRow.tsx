import { ExternalLink } from "lucide-react";
import type { HotSearchItem } from "../data/types";
import { RankBadge } from "./RankBadge";
import { HeatBadge } from "./HeatBadge";

interface Props {
  item: HotSearchItem;
  maxHot?: number;
  variant?: "compact" | "detailed";
  accent?: string;
}

const TAG_STYLES: Record<string, string> = {
  新: "bg-spark-400/15 text-spark-500",
  热: "bg-flame-500/15 text-flame-600",
  沸: "bg-flame-500/15 text-flame-600",
  爆: "bg-flame-500 text-white",
  推荐: "bg-brand-zhihu/15 text-brand-zhihu",
};

export function HotSearchRow({
  item,
  maxHot,
  variant = "compact",
  accent,
}: Props) {
  const isDetailed = variant === "detailed";
  const tagStyle = item.tag ? TAG_STYLES[item.tag] ?? "bg-ink-50 text-ink-500" : "";

  const content = (
    <>
      <RankBadge rank={item.index} size={isDetailed ? "lg" : "md"} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={`truncate font-medium text-ink-900 transition-colors ${
              isDetailed ? "text-[15px]" : "text-sm"
            } group-hover:text-flame-600`}
          >
            {item.title}
          </h4>
          {item.tag && (
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-2xs font-semibold ${tagStyle}`}
            >
              {item.tag}
            </span>
          )}
        </div>
        {item.desc && (
          <p
            className={`text-ink-400 mt-1 line-clamp-1 ${
              isDetailed ? "text-xs" : "text-2xs"
            }`}
          >
            {item.desc}
          </p>
        )}
      </div>
      <div className="shrink-0">
        <HeatBadge
          label={item.hotLabel}
          hot={item.hot}
          maxHot={maxHot}
          showBar={isDetailed}
          color={accent}
        />
      </div>
      {isDetailed && (
        <ExternalLink
          className="shrink-0 w-4 h-4 text-ink-300 group-hover:text-flame-500 transition-colors"
          strokeWidth={2}
        />
      )}
    </>
  );

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-3 transition-all ${
        isDetailed
          ? "px-5 py-3.5 hover:bg-flame-50/40"
          : "px-3 py-2.5 hover:bg-ink-50"
      } rounded-lg`}
    >
      {content}
    </a>
  );
}
