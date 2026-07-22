import { config } from './config.js';
import { fetchJson, UpstreamError } from './fetcher.js';

/**
 * MediaWiki API 代理。
 * 把调用方的查询参数透传到上游 wiki（默认 minecraft.wiki），
 * 仅允许白名单内的 base，防止开放代理 / SSRF。
 *
 * @param {URLSearchParams} params  调用方传入的查询参数
 * @param {object} [opts]
 * @param {string} [opts.base]      指定上游 base，必须在白名单中
 * @param {number} [opts.ttl]       缓存秒数（默认 300）
 * @returns {Promise<{base:string, url:string, data:object}>}
 */
export async function proxyWiki(params, opts = {}) {
  const base = opts.base || config.wikiBase;
  if (!config.wikiAllowlist.includes(base)) {
    throw new UpstreamError(`不允许的 wiki 上游: ${base}`, 0);
  }

  // 强制 JSON 输出
  const merged = new URLSearchParams(params);
  if (!merged.has('format')) merged.set('format', 'json');
  if (merged.get('format') === 'jsonfm') merged.set('format', 'json');
  if (!merged.has('formatversion')) merged.set('formatversion', '2');

  const url = `${base}?${merged.toString()}`;
  const data = await fetchJson(url, {
    ttl: opts.ttl ?? 300,
    userAgent: config.wikiUserAgent,
    accept: 'application/json',
  });
  return { base, url, data };
}
