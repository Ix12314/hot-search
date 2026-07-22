import process from 'node:process';

/**
 * 全局配置。所有值均可通过环境变量覆盖。
 */
export const config = {
  port: Number(process.env.PORT || 3000),
  // 对外请求 MCMod 时使用的 User-Agent（保持礼貌，避免被识别为恶意爬虫）
  userAgent:
    process.env.USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  // Minecraft Wiki (MediaWiki) 代理专用 UA。
  // 注意：minecraft.wiki 由 Cloudflare 保护，会拦截"浏览器 UA + Node TLS 指纹"组合，
  // 因此 wiki 代理需使用非浏览器 UA（MCMod 抓取仍用上面的浏览器 UA）。
  wikiUserAgent: process.env.WIKI_USER_AGENT || 'mcmod-api-wiki-proxy/1.0 (Node.js; contact: admin@example.com)',
  // 上游抓取超时（毫秒）
  upstreamTimeout: Number(process.env.UPSTREAM_TIMEOUT || 15000),
  // 缓存 TTL（秒）
  cacheTtl: Number(process.env.CACHE_TTL || 600), // 10 分钟
  // 缓存最大条目数
  cacheMax: Number(process.env.CACHE_MAX || 500),
  // 上游并发请求数上限（令牌桶，保护 mcmod.cn）
  upstreamConcurrency: Number(process.env.UPSTREAM_CONCURRENCY || 4),
  // 每个来源基础 URL
  mcmodBase: process.env.MCMOD_BASE || 'https://www.mcmod.cn',
  mcmodSearchBase: process.env.MCMOD_SEARCH_BASE || 'https://search.mcmod.cn',
  // Minecraft Wiki (MediaWiki) API 基础地址
  wikiBase: process.env.WIKI_BASE || 'https://minecraft.wiki/api.php',
  // 允许代理的 wiki 基础地址白名单（防止开放重定向 / SSRF）
  wikiAllowlist: (process.env.WIKI_ALLOWLIST ||
    'https://minecraft.wiki/api.php,https://wiki.biligame.com/mc/api.php').split(','),
  // 每分钟每 IP 最大请求数（简单限流）
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE || 120),
};

// MCMod 顶层分类 ID（来自站点导航，便于直接调用 /api/category/:id）
export const CATEGORIES = [
  { id: 1, name: '科技MOD' },
  { id: 2, name: '魔法MOD' },
  { id: 3, name: '冒险MOD' },
  { id: 4, name: '农业MOD' },
  { id: 5, name: '装饰MOD' },
  { id: 6, name: '核心插件/库' },
  { id: 7, name: '辅助MOD' },
  { id: 8, name: '世界MOD' },
  { id: 9, name: '基础MOD' },
  { id: 10, name: '服务器MOD' },
  { id: 11, name: '拓展MOD' },
  { id: 12, name: '血魔法' },
  { id: 21, name: '整合包' },
  { id: 17, name: '资料' },
];
