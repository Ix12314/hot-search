import { config } from './config.js';
import { TtlCache } from './cache.js';

const cache = new TtlCache(config.cacheTtl, config.cacheMax);

/**
 * 简单的并发信号量：限制对上游的同时请求量。
 */
class Semaphore {
  constructor(max) {
    this.max = max;
    this.active = 0;
    this.queue = [];
  }
  async run(task) {
    if (this.active >= this.max) {
      await new Promise((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
const sem = new Semaphore(config.upstreamConcurrency);

/**
 * 抓取指定 URL 的文本内容，带缓存 + 超时 + 并发限制。
 * @param {string} url
 * @param {object} [opts]
 * @param {number} [opts.ttl]  覆盖默认缓存时间（秒），0 表示不缓存
 * @returns {Promise<string>}
 */
export async function fetchText(url, opts = {}) {
  const ttl = opts.ttl ?? config.cacheTtl;
  if (ttl > 0) {
    const hit = cache.get(url);
    if (hit !== undefined) return hit;
  }

  const ua = opts.userAgent || config.userAgent;
  const accept = opts.accept || 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8';

  const body = await sem.run(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.upstreamTimeout);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          Accept: accept,
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new UpstreamError(`上游返回 HTTP ${res.status}`, res.status);
      }
      // MCMod 全站 UTF-8
      return await res.text();
    } catch (err) {
      if (err instanceof UpstreamError) throw err;
      throw new UpstreamError(`抓取失败: ${err.message}`, 0);
    } finally {
      clearTimeout(timer);
    }
  });

  if (ttl > 0) cache.set(url, body);
  return body;
}

/** 抓取 JSON（用于 MediaWiki 代理）。默认不缓存（wiki 数据多变）。 */
export async function fetchJson(url, { ttl = 0, userAgent, accept } = {}) {
  if (ttl > 0) {
    const hit = cache.get(url);
    if (hit !== undefined) return hit;
  }
  const text = await fetchText(url, { ttl: 0, userAgent, accept });
  try {
    const json = JSON.parse(text);
    if (ttl > 0) cache.set(url, json);
    return json;
  } catch {
    throw new UpstreamError('上游返回了非 JSON 内容', 0);
  }
}

export class UpstreamError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'UpstreamError';
    this.upstreamStatus = status;
  }
}

export function cacheStats() {
  return { size: cache.size, maxSize: cache.maxSize, ttlSeconds: config.cacheTtl };
}
