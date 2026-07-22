import express from 'express';
import { config, CATEGORIES } from './config.js';
import { fetchText, UpstreamError, cacheStats } from './fetcher.js';
import {
  parseSearch,
  parseDetail,
  parseCategoryList,
  parseModItemList,
} from './parser.js';
import { proxyWiki } from './wiki.js';

export const router = express.Router();

// 统一把 upstream 错误转成合适的 HTTP 状态
function upstreamStatus(err) {
  if (err instanceof UpstreamError) {
    if (err.upstreamStatus === 404) return 404;
    if (err.upstreamStatus >= 500) return 502;
    return 502;
  }
  return 500;
}

/* ------------------------------------------------------------------ *
 * 搜索
 * GET /api/search?q=钻石&page=1
 * ------------------------------------------------------------------ */
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    if (!q) return res.status(400).json({ error: '缺少参数 q (关键词)' });

    const url = `${config.mcmodSearchBase}/s?key=${encodeURIComponent(q)}&page=${page}`;
    const html = await fetchText(url);
    const data = parseSearch(html);
    res.json({ query: q, page, ...data, sourceUrl: url });
  } catch (err) {
    res.status(upstreamStatus(err)).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * 词条详情
 * GET /api/detail/item/296
 * GET /api/detail/class/2     (模组)
 * GET /api/detail/mod/2
 * ------------------------------------------------------------------ */
const ALLOWED_TYPES = new Set(['item', 'class', 'mod', 'post']);
router.get('/detail/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ error: `不支持的类型: ${type}（支持: item/class/mod/post）` });
    }
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'id 必须为数字' });
    }
    const url = `${config.mcmodBase}/${type}/${id}.html`;
    const html = await fetchText(url);
    const data = parseDetail(html, { type, id, url });
    res.json(data);
  } catch (err) {
    res.status(upstreamStatus(err)).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * 分类列表（某分类下的模组）
 * GET /api/category/1?page=1
 * GET /api/categories           列出常见分类
 * ------------------------------------------------------------------ */
router.get('/categories', (req, res) => {
  res.json({ count: CATEGORIES.length, categories: CATEGORIES });
});

router.get('/category/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: '分类 id 必须为数字' });
    const page = Math.max(1, Number(req.query.page) || 1);
    const url = `${config.mcmodBase}/class/category/${id}-${page}.html`;
    const html = await fetchText(url);
    const data = parseCategoryList(html, { categoryId: id, page });
    res.json({ ...data, sourceUrl: url });
  } catch (err) {
    res.status(upstreamStatus(err)).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * 模组下的物品/方块列表
 * GET /api/mod/2/items?page=1
 * ------------------------------------------------------------------ */
router.get('/mod/:modId/items', async (req, res) => {
  try {
    const modId = req.params.modId;
    if (!/^\d+$/.test(modId)) return res.status(400).json({ error: 'modId 必须为数字' });
    const page = Math.max(1, Number(req.query.page) || 1);
    const url = `${config.mcmodBase}/item/list/${modId}-${page}.html`;
    const html = await fetchText(url);
    const data = parseModItemList(html, { modId, page });
    res.json({ ...data, sourceUrl: url });
  } catch (err) {
    res.status(upstreamStatus(err)).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * Minecraft Wiki (MediaWiki) 代理
 * GET /api/wiki?action=query&list=search&srsearch=Diamond
 * GET /api/wiki?base=https://wiki.biligame.com/mc/api.php&...
 * ------------------------------------------------------------------ */
router.get('/wiki', async (req, res) => {
  try {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k === 'base') continue; // base 单独处理
      params.set(k, String(v));
    }
    const base = req.query.base ? String(req.query.base) : undefined;
    const { base: usedBase, url, data } = await proxyWiki(params, { base });
    res.json({ base: usedBase, url, data });
  } catch (err) {
    res.status(upstreamStatus(err)).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * 运维端点
 * ------------------------------------------------------------------ */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), cache: cacheStats() });
});
