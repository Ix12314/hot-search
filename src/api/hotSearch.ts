import { PLATFORM_MAP } from "../data/platforms";
import type { PlatformId } from "../data/platforms";
import type { FetchResult, HotSearchItem, PlatformHotList } from "../data/types";
import { buildDemoList } from "../data/mockData";

/**
 * 实时热搜聚合 API
 *
 * 使用多源回退策略保证数据可用：
 * 1. 主源：imsyy DailyHot API (Cloudflare 部署，原生 CORS)
 * 2. 备源：vvhan API + CORS 代理
 * 3. 终回退：内置示例数据（明确标记为 demo）
 */

const PRIMARY_API = "https://api-hot.imsyy.top";
const SECONDARY_API = "https://api.vvhan.com/api/hotlist";
// 多个 CORS 代理，依次尝试
const CORS_PROXIES = [
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function formatHot(value: string | number): { hot: number; label: string } {
  const num = typeof value === "number" ? value : parseInt(String(value).replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(num)) return { hot: 0, label: "0" };
  if (num >= 100000000) return { hot: num, label: `${(num / 100000000).toFixed(2)}亿` };
  if (num >= 10000) return { hot: num, label: `${(num / 10000).toFixed(1)}万` };
  return { hot: num, label: String(num) };
}

interface ImsyyItem {
  title: string;
  desc?: string;
  hot?: string | number;
  url?: string;
  mobileUrl?: string;
  cover?: string;
  index?: number;
}

interface ImsyyResponse {
  code: number;
  name?: string;
  subtitle?: string;
  from?: string;
  total?: number;
  update?: string;
  data?: ImsyyItem[];
}

function parseImsyy(
  json: ImsyyResponse,
  platformId: PlatformId
): PlatformHotList | null {
  if (!json || json.code !== 200 || !Array.isArray(json.data)) return null;
  const platform = PLATFORM_MAP[platformId];
  const items: HotSearchItem[] = json.data.map((raw, i) => {
    const { hot, label } = formatHot(raw.hot ?? 0);
    return {
      id: `${platformId}-${i + 1}`,
      title: raw.title ?? "",
      desc: raw.desc ?? "",
      hot,
      hotLabel: label,
      url: raw.url || raw.mobileUrl || "#",
      index: raw.index ?? i + 1,
      cover: raw.cover,
    };
  });
  return {
    platformId,
    platformName: json.name ?? platform.name,
    subtitle: json.subtitle ?? "实时",
    source: json.from ?? platform.shortName,
    updatedAt: json.update ?? new Date().toISOString(),
    total: json.total ?? items.length,
    items,
  };
}

interface VvhanResponse {
  success?: boolean;
  name?: string;
  subtitle?: string;
  update_time?: string;
  data?: {
    title: string;
    hot?: string | number;
    url?: string;
    mobil_url?: string;
    index?: number;
  }[];
}

function parseVvhan(
  json: VvhanResponse,
  platformId: PlatformId
): PlatformHotList | null {
  if (!json || !Array.isArray(json.data)) return null;
  const platform = PLATFORM_MAP[platformId];
  const items: HotSearchItem[] = json.data.map((raw, i) => {
    const { hot, label } = formatHot(raw.hot ?? 0);
    return {
      id: `${platformId}-${i + 1}`,
      title: raw.title ?? "",
      hot,
      hotLabel: label,
      url: raw.url || raw.mobil_url || "#",
      index: raw.index ?? i + 1,
    };
  });
  return {
    platformId,
    platformName: json.name ?? platform.name,
    subtitle: json.subtitle ?? "实时",
    source: platform.shortName,
    updatedAt: json.update_time ?? new Date().toISOString(),
    total: items.length,
    items,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await withTimeout(fetch(url, { mode: "cors" }), TIMEOUT_MS);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchPrimary(platformId: PlatformId): Promise<PlatformHotList> {
  const platform = PLATFORM_MAP[platformId];
  const url = `${PRIMARY_API}/dailyHotList/${platform.apiType}`;
  const json = (await fetchJson(url)) as ImsyyResponse;
  const parsed = parseImsyy(json, platformId);
  if (!parsed) throw new Error("primary parse failed");
  return parsed;
}

async function fetchSecondary(platformId: PlatformId): Promise<PlatformHotList> {
  const platform = PLATFORM_MAP[platformId];
  const url = `${SECONDARY_API}/${platform.apiType}`;
  // 先直接请求
  let json: VvhanResponse | null = null;
  try {
    json = (await fetchJson(url)) as VvhanResponse;
  } catch {
    // 走 CORS 代理
    for (const proxy of CORS_PROXIES) {
      try {
        json = (await fetchJson(proxy(url))) as VvhanResponse;
        if (json) break;
      } catch {
        // try next proxy
      }
    }
  }
  if (!json) throw new Error("secondary all failed");
  const parsed = parseVvhan(json, platformId);
  if (!parsed) throw new Error("secondary parse failed");
  return parsed;
}

export async function fetchPlatformHotList(
  platformId: PlatformId
): Promise<FetchResult> {
  try {
    const data = await fetchPrimary(platformId);
    return { data, source: "live" };
  } catch (primaryErr) {
    try {
      const data = await fetchSecondary(platformId);
      return { data, source: "live" };
    } catch (secondaryErr) {
      // 终回退：演示数据
      const platform = PLATFORM_MAP[platformId];
      const data = buildDemoList(platformId, platform.name);
      return { data, source: "demo" };
    }
  }
}

export async function fetchMultiplePlatforms(
  platformIds: PlatformId[]
): Promise<Record<PlatformId, FetchResult>> {
  const entries = await Promise.all(
    platformIds.map(async (id) => [id, await fetchPlatformHotList(id)] as const)
  );
  return Object.fromEntries(entries) as Record<PlatformId, FetchResult>;
}
