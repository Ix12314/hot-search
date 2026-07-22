import express from 'express';
import { config } from './config.js';
import { router } from './routes.js';

const app = express();
app.disable('x-powered-by');
app.set('json spaces', 2);

// 简单的每 IP 限流（令牌桶式滑动窗口）
const hits = new Map(); // ip -> [timestamps]
const WINDOW = 60_000;
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/') return next();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  arr.push(now);
  hits.set(ip, arr);
  if (arr.length > config.rateLimitPerMinute) {
    return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
  }
  next();
});

// CORS（便于前端直接调用）
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api', router);

/* ------------------------------------------------------------------ *
 * 首页：API 文档（纯 HTML，零依赖）
 * ------------------------------------------------------------------ */
app.get('/', (req, res) => {
  res.type('html').send(DOCS_HTML);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: '路径不存在', hint: '访问 / 查看 API 文档' });
});

// 兜底错误处理
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('[unhandled]', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`MC百科 API 已启动: http://localhost:${config.port}`);
  console.log(`文档: http://localhost:${config.port}/  |  健康检查: /api/health`);
});

const DOCS_HTML = /* html */ `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MC百科 API · 非官方</title>
<style>
  :root{--bg:#0f1117;--card:#171a21;--fg:#e6e6e6;--muted:#9aa0aa;--acc:#5b8def;--acc2:#36c5a0;--bd:#262a33}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,Segoe UI,Roboto,"PingFang SC","Microsoft YaHei",sans-serif}
  .wrap{max-width:920px;margin:0 auto;padding:40px 20px 80px}
  h1{font-size:30px;margin:0 0 4px}h1 span{color:var(--acc2)}
  .sub{color:var(--muted);margin:0 0 8px}
  .badge{display:inline-block;background:var(--card);border:1px solid var(--bd);color:var(--acc2);border-radius:20px;padding:2px 12px;font-size:12px;margin-right:6px}
  section{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:18px 20px;margin:16px 0}
  h2{margin:0 0 4px;font-size:18px;color:var(--acc)}h2 .m{color:var(--muted);font-weight:400;font-size:13px}
  .desc{color:var(--muted);margin:4px 0 10px}
  code,pre{font-family:JetBrains Mono,Consolas,monospace}
  pre{background:#0c0e13;border:1px solid var(--bd);border-radius:8px;padding:12px;overflow:auto;color:#cdd6e4}
  .q{color:var(--acc2)}table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--bd);font-size:13px;color:var(--muted)}
  th{color:var(--fg)}a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
</style></head><body><div class="wrap">
<h1>MC<span>百科</span> API</h1>
<p class="sub">非官方 REST API · 数据源 <a href="https://www.mcmod.cn" target="_blank">mcmod.cn</a> + <a href="https://minecraft.wiki" target="_blank">Minecraft Wiki</a></p>
<p>
  <span class="badge">Node + Express</span>
  <span class="badge">内置缓存</span>
  <span class="badge">限流</span>
  <span class="badge">CORS</span>
</p>
<p class="desc">所有接口均为 <code>GET</code>，返回 JSON。基础路径 <code>/api</code>。</p>

<section>
<h2>GET /api/search <span class="m">搜索词条</span></h2>
<p class="desc">关键词搜索 MC百科（模组 / 物品 / 教程等）。</p>
<table><tr><th>参数</th><th>必填</th><th>说明</th></tr>
<tr><td>q</td><td>是</td><td>关键词</td></tr>
<tr><td>page</td><td>否</td><td>页码，默认 1</td></tr></table>
<pre>curl "<span class="q">/api/search?q=钻石</span>"</pre>
</section>

<section>
<h2>GET /api/detail/:type/:id <span class="m">词条详情</span></h2>
<p class="desc"><code>type</code> ∈ item(物品/方块) · class(模组) · mod · post(文章)。id 为 MC百科数字 ID。</p>
<table><tr><th>参数</th><th>位置</th><th>说明</th></tr>
<tr><td>type</td><td>path</td><td>item / class / mod / post</td></tr>
<tr><td>id</td><td>path</td><td>数字 ID（见搜索结果或站点 URL）</td></tr></table>
<pre>curl "<span class="q">/api/detail/item/296</span>"   # 密封反应堆隔热板
curl "<span class="q">/api/detail/class/2</span>"  # 工业时代2</pre>
</section>

<section>
<h2>GET /api/category/:id <span class="m">分类列表</span></h2>
<p class="desc">列出某分类下的模组。常见分类见 <code>/api/categories</code>。</p>
<table><tr><th>参数</th><th>位置</th><th>说明</th></tr>
<tr><td>id</td><td>path</td><td>分类 ID（如 1=科技, 2=魔法）</td></tr>
<tr><td>page</td><td>query</td><td>页码，默认 1</td></tr></table>
<pre>curl "<span class="q">/api/category/1?page=1</span>"   # 科技MOD
curl "<span class="q">/api/categories</span>"</pre>
</section>

<section>
<h2>GET /api/mod/:modId/items <span class="m">模组物品列表</span></h2>
<p class="desc">列出某模组下的物品/方块，按类型分组，含中英文名。</p>
<table><tr><th>参数</th><th>位置</th><th>说明</th></tr>
<tr><td>modId</td><td>path</td><td>模组 ID（即 class ID）</td></tr>
<tr><td>page</td><td>query</td><td>页码，默认 1</td></tr></table>
<pre>curl "<span class="q">/api/mod/2/items?page=1</span>"   # 工业时代2 物品</pre>
</section>

<section>
<h2>GET /api/wiki <span class="m">Minecraft Wiki 代理</span></h2>
<p class="desc">透传 MediaWiki API 参数到上游 wiki（默认 minecraft.wiki）。可经 <code>base</code> 切换白名单内的上游。</p>
<table><tr><th>参数</th><th>说明</th></tr>
<tr><td>action, list, srsearch ...</td><td>任意 MediaWiki api.php 参数</td></tr>
<tr><td>base</td><td>可选，指定上游 api.php（需在白名单）</td></tr></table>
<pre>curl "<span class="q">/api/wiki?action=query&list=search&srsearch=Diamond</span>"
curl "<span class="q">/api/wiki?action=parse&page=Diamond&prop=wikitext</span>"</pre>
</section>

<section>
<h2>GET /api/health <span class="m">健康检查</span></h2>
<p class="desc">服务状态、运行时间、缓存命中情况。</p>
<pre>curl "<span class="q">/api/health</span>"</pre>
</section>

<p class="desc" style="margin-top:24px">⚠ 本服务为非官方聚合，仅供学习用途，请勿高频请求；数据版权归原作者所有。
配置项见 <code>src/config.js</code>（端口 PORT、缓存 CACHE_TTL、限流 RATE_LIMIT_PER_MINUTE 等）。</p>
</div></body></html>`;
