import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import type { ViewKey } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";
import { HotSearchView } from "./views/HotSearchView";
import { MoreView } from "./views/MoreView";
import { PLATFORMS } from "./data/platforms";
import type { PlatformId } from "./data/platforms";
import type { FetchResult } from "./data/types";
import { fetchPlatformHotList } from "./api/hotSearch";

type PlatformResults = Partial<Record<PlatformId, FetchResult>>;

function App() {
  const [view, setView] = useState<ViewKey>("home");
  const [activePlatform, setActivePlatform] = useState<PlatformId>("weibo");
  const [results, setResults] = useState<PlatformResults>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async (mode: "load" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    try {
      const ids = PLATFORMS.map((p) => p.id);
      const entries = await Promise.all(
        ids.map(async (id) => {
          const r = await fetchPlatformHotList(id);
          return [id, r] as const;
        })
      );
      setResults(Object.fromEntries(entries) as Record<PlatformId, FetchResult>);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll("load");
  }, [loadAll]);

  const liveStatus = useMemo<"live" | "demo">(() => {
    return Object.values(results).some((r) => r?.source === "live")
      ? "live"
      : "demo";
  }, [results]);

  const handleViewChange = useCallback((v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleOpenPlatform = useCallback(
    (id: PlatformId) => {
      setActivePlatform(id);
      setView("hot");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  return (
    <div className="min-h-full flex flex-col">
      <Header
        current={view}
        onChange={handleViewChange}
        onRefresh={() => loadAll("refresh")}
        refreshing={refreshing}
        liveStatus={liveStatus}
      />

      <main className="flex-1">
        {view === "home" && (
          <HomeView
            results={results}
            loading={loading}
            onViewPlatform={handleOpenPlatform}
            onViewHot={() => handleViewChange("hot")}
          />
        )}
        {view === "hot" && (
          <HotSearchView
            initialPlatform={activePlatform}
            onPlatformChange={setActivePlatform}
            onSourceChange={() => {}}
          />
        )}
        {view === "more" && (
          <MoreView
            results={results}
            onOpenPlatform={handleOpenPlatform}
            onRefreshAll={() => loadAll("refresh")}
            refreshing={refreshing}
          />
        )}
      </main>

      <Footer source={liveStatus} />
    </div>
  );
}

export default App;
