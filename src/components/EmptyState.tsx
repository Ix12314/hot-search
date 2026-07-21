import { Inbox, RefreshCw } from "lucide-react";

interface EmptyProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function EmptyState({
  title = "暂无数据",
  description = "稍后再来看看吧",
  onRetry,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-ink-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-ink-700 mb-1">{title}</h3>
      <p className="text-sm text-ink-400 mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-flame-600 bg-flame-50 hover:bg-flame-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2.2} />
          重试
        </button>
      )}
    </div>
  );
}

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "数据加载失败",
  onRetry,
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-flame-50 flex items-center justify-center mb-4">
        <RefreshCw className="w-7 h-7 text-flame-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-ink-700 mb-1">{message}</h3>
      <p className="text-sm text-ink-400 mb-4">可能是网络或接口暂时不可用</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-flame-600 bg-flame-50 hover:bg-flame-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2.2} />
          重新加载
        </button>
      )}
    </div>
  );
}
