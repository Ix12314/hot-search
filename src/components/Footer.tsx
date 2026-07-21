import { Heart } from "lucide-react";

interface Props {
  source: "live" | "demo";
}

export function Footer({ source }: Props) {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-canvas">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-ink-900">今日热榜</span>
              <span className="text-2xs text-ink-300">Hot Rank Aggregator</span>
            </div>
            <p className="text-2xs text-ink-400">
              聚合主流平台实时热搜榜单，每分钟自动刷新。数据来源公开网络，仅供学习参考。
            </p>
          </div>
          <div className="flex items-center gap-4 text-2xs text-ink-400">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  source === "live" ? "bg-brand-weixin animate-pulse-dot" : "bg-ink-300"
                }`}
              />
              {source === "live" ? "实时数据" : "示例数据"}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">数据接口：DailyHotApi</span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1">
              Made with
              <Heart className="w-3 h-3 text-flame-500" fill="currentColor" />
              by Trae
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
