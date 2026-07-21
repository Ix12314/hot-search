import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPlatformHotList } from "../api/hotSearch";
import type { FetchResult, PlatformHotList } from "../data/types";
import type { PlatformId } from "../data/platforms";

interface State {
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  result: FetchResult | null;
  list: PlatformHotList | null;
}

const INITIAL: State = {
  loading: true,
  refreshing: false,
  error: null,
  result: null,
  list: null,
};

export function useHotSearch(platformId: PlatformId, autoRefresh = false) {
  const [state, setState] = useState<State>(INITIAL);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (mode: "load" | "refresh" = "load") => {
      if (mode === "refresh") {
        setState((s) => ({ ...s, refreshing: true }));
      } else {
        setState((s) => ({ ...s, loading: true }));
      }
      try {
        const result = await fetchPlatformHotList(platformId);
        if (!mountedRef.current) return;
        setState({
          loading: false,
          refreshing: false,
          error: null,
          result,
          list: result.data,
        });
      } catch (err) {
        if (!mountedRef.current) return;
        setState({
          loading: false,
          refreshing: false,
          error: err instanceof Error ? err : new Error(String(err)),
          result: null,
          list: null,
        });
      }
    },
    [platformId]
  );

  const refresh = useCallback(() => load("refresh"), [load]);

  useEffect(() => {
    mountedRef.current = true;
    load("load");
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoRefresh) {
      timerRef.current = setInterval(() => load("refresh"), 60_000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, load]);

  return { ...state, refresh };
}

export function useMultiHotSearch(
  platformIds: PlatformId[],
  deps: unknown[] = []
) {
  const [results, setResults] = useState<
    Partial<Record<PlatformId, FetchResult>>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mode: "load" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    try {
      const entries = await Promise.all(
        platformIds.map(async (id) => {
          const r = await fetchPlatformHotList(id);
          return [id, r] as const;
        })
      );
      const map = Object.fromEntries(entries) as Record<PlatformId, FetchResult>;
      setResults(map);
      setLoading(false);
      setRefreshing(false);
    } catch {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, platformIds);

  useEffect(() => {
    load("load");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => load("refresh"), [load]);

  return { results, loading, refreshing, refresh };
}
