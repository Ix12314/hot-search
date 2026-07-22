import * as cheerio from 'cheerio';
import { config } from './config.js';

/* ------------------------------------------------------------------ *
 * 通用辅助
 * ------------------------------------------------------------------ */

/** 把 "中文名 (English Name)" 拆成 { name, englishName } */
export function splitNameEnglish(text) {
  if (!text) return { name: '', englishName: '' };
  const clean = text.replace(/\s+/g, ' ').trim();
  const m = clean.match(/^(.*?)\s*[（(]\s*([^()（）]*?)\s*[)）]\s*$/);
  if (m) {
    return { name: m[1].trim(), englishName: m[2].trim() };
  }
  return { name: clean, englishName: '' };
}

/**
 * 从 <title> 文本中解析结构化名称。
 * 物品页:  "密封反应堆隔热板 (Containment Reactor Plating) - [IC2]工业时代2 (Industrial Craft 2) - MC百科|..."
 * 模组页:  "[IC2]工业时代2 (Industrial Craft 2) - MC百科|..."
 */
export function parseTitle(titleText) {
  const base = (titleText || '').split(/\s*-\s*MC百科/)[0].trim();
  const segs = base.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  const result = { name: '', englishName: '', modTag: '', modName: '', modEnglishName: '', segments: segs };
  if (segs.length === 0) return result;

  // 含 [TAG] 的段视为模组段
  const modSeg = segs.find((s) => /^\[[^\]]+\]/.test(s));
  const nameSeg = segs.find((s) => s !== modSeg) || segs[0];

  if (modSeg) {
    const mm = modSeg.match(/^\[([^\]]+)\]\s*(.*)$/);
    result.modTag = mm ? mm[1] : '';
    const rest = mm ? mm[2] : modSeg;
    const { name, englishName } = splitNameEnglish(rest);
    result.modName = name;
    result.modEnglishName = englishName;
  }
  if (nameSeg) {
    const { name, englishName } = splitNameEnglish(nameSeg);
    result.name = name;
    result.englishName = englishName;
  }
  // 模组详情页：name 段本身就是模组段
  if (modSeg && !nameSeg) {
    result.name = result.modName;
    result.englishName = result.modEnglishName;
  }
  return result;
}

/** 从 URL 路径提取 type 与 id，如 https://www.mcmod.cn/item/296.html -> {type:'item', id:'296'} */
export function parseEntryUrl(url) {
  const m = /\/(item|class|mod|post|author)\/(\d+)\.html/.exec(url || '');
  if (!m) return null;
  return { type: m[1], id: m[2] };
}

/** 清洗 MCMod 文本：去掉 [h1=...] 这类标记、HTML 实体、多余空白 */
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\[h\d=[^\]]*\]/g, '')
    .replace(/\[\/h\d\]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ *
 * 搜索结果解析
 * ------------------------------------------------------------------ */
export function parseSearch(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('.result-item').each((_, el) => {
    const $el = $(el);
    // 标题链接是 .head 的直接子 <a>（排除 .class-category 内的链接）
    const $titleLink = $el.find('.head > a').first();
    const title = cleanText($titleLink.text());
    const href = $titleLink.attr('href') || '';
    const entry = parseEntryUrl(href) || {};

    // 分类 id：.class-category a 的 class c_NN
    const catClass = $el.find('.class-category a').attr('class') || '';
    const catMatch = /\bc_(\d+)\b/.exec(catClass);

    const snippet = cleanText($el.find('.body').text());

    // 快照时间 / 来源
    const footText = $el.find('.foot').text();
    const snapMatch = /快照时间[:：]\s*([\d-]+)/.exec(footText);

    const { name, englishName } = splitNameEnglish(title);
    results.push({
      title,
      name,
      englishName,
      type: entry.type || null,
      id: entry.id || null,
      url: normalizeUrl(href),
      categoryId: catMatch ? Number(catMatch[1]) : null,
      snippet,
      snapshot: snapMatch ? snapMatch[1] : null,
    });
  });

  // 尝试解析结果总数
  let total = null;
  const bodyText = $('body').text();
  const totalMatch = /共\s*(\d+)\s*条|找到[约]?\s*(\d+)\s*条/.exec(bodyText);
  if (totalMatch) total = Number(totalMatch[1] || totalMatch[2]);

  return { total, count: results.length, results };
}

/* ------------------------------------------------------------------ *
 * 词条详情解析（物品 / 模组 / mod）
 * ------------------------------------------------------------------ */
export function parseDetail(html, { type, id, url }) {
  const $ = cheerio.load(html);
  const titleText = $('title').first().text();
  const parsed = parseTitle(titleText);

  // 面包屑：含 #MoldLink 的 ul
  const breadcrumb = [];
  const $mold = $('#MoldLink');
  if ($mold.length) {
    $mold.closest('ul, ol')
      .find('li')
      .not('.line')
      .each((_, li) => {
        const t = cleanText($(li).text());
        if (t) breadcrumb.push(t);
      });
  }

  // 物品命令 /give
  const giveCommand = $('[data-command]').first().attr('data-command') || null;

  // 封面图：优先 og:image，其次信息区第一张图
  let cover = $('meta[property="og:image"]').attr('content') || null;
  if (!cover) {
    cover = $('.item-info-table img, .class-icon img, .mod-icon img, .frame img')
      .first()
      .attr('src') || null;
  }
  if (cover) cover = normalizeUrl(cover);

  // 页面摘要
  const summary = $('meta[name="description"]').attr('content') || null;

  // 正文文本：定位主内容容器，剥离导航/侧栏/相关物品等噪声后取 text
  const scopeSelectors = [
    '.maintext', '.item-text', '.class-text', '.mod-text', '.post-text',
    '.item-row', '.col-lg-9', '.col-lg-12.right',
  ];
  let $scope = null;
  for (const sel of scopeSelectors) {
    const $c = $(sel).first();
    if ($c.length && cleanText($c.text()).length > 40) {
      $scope = $c;
      break;
    }
  }
  if (!$scope) $scope = $mold.length ? $mold.closest('div').parent() : $('body');
  $scope.find('script, style, noscript, .common-imglist-block, .header, .footer, nav, .sidebar, .left-menu, .comment, .item-give, .tool, .item-jump, iframe, .ad, .ad-leftside').remove();
  const text = cleanText($scope.text());

  // 属性表：尝试从 .item-info-table 抽取键值
  const properties = {};
  $('.item-info-table td, .common-table td').each((_, td) => {
    const $td = $(td);
    const t = cleanText($td.text());
    if (!t) return;
    // MCMod 属性表多为并排小图块，键值不易稳定抽取，这里仅收集非空文本块
    if (!properties._cells) properties._cells = [];
    properties._cells.push(t);
  });

  return {
    type,
    id,
    url,
    ...parsed,
    breadcrumb,
    giveCommand,
    cover,
    summary,
    text,
    properties: properties._cells || [],
  };
}

/* ------------------------------------------------------------------ *
 * 分类列表解析（列出某分类下的模组）
 * ------------------------------------------------------------------ */
export function parseCategoryList(html, { categoryId, page }) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const items = [];

  $('.block').each((_, block) => {
    const $block = $(block);
    const $a = $block.find('a[href^="/class/"]').first();
    if (!$a.length) return;
    const href = $a.attr('href');
    const m = /\/class\/(\d+)\.html/.exec(href || '');
    if (!m) return;
    const id = m[1];
    if (seen.has(id)) return;
    seen.add(id);

    const titleAttr = $a.attr('title') || '';
    const nameText = cleanText(titleAttr) || cleanText($a.text());
    const { name, englishName } = splitNameEnglish(nameText);
    const modTagMatch = nameText.match(/^\[([^\]]+)\]/);

    let cover = $block.find('img').first().attr('src') || $block.find('img').first().attr('data-original') || null;
    if (cover) cover = normalizeUrl(cover);

    const desc = cleanText($block.find('.body, .text, .desc').first().text()) || null;

    items.push({
      id,
      name,
      englishName,
      modTag: modTagMatch ? modTagMatch[1] : null,
      cover,
      url: `${config.mcmodBase}/class/${id}.html`,
      description: desc,
    });
  });

  const totalPages = maxPageFromLinks($, (href) => /\/class\/category\/\d+-(\d+)\.html/.exec(href || ''));
  return {
    categoryId: Number(categoryId),
    page: Number(page),
    totalPages,
    count: items.length,
    items,
  };
}

/* ------------------------------------------------------------------ *
 * 模组物品列表解析
 * ------------------------------------------------------------------ */
export function parseModItemList(html, { modId, page }) {
  const $ = cheerio.load(html);
  const groups = [];
  let currentGroup = null;

  // 标题里的模组名
  const titleText = $('title').first().text();
  const parsed = parseTitle(titleText);

  $('table tbody tr').each((_, tr) => {
    const $tr = $(tr);
    const $th = $tr.find('th.item-list-type-left');
    if ($th.length) {
      const typeName = cleanText($th.text());
      currentGroup = { type: typeName, items: [] };
      groups.push(currentGroup);
    }
    if (!currentGroup) {
      currentGroup = { type: '其它', items: [] };
      groups.push(currentGroup);
    }
    $tr.find('a[href^="/item/"]').each((__, a) => {
      const $a = $(a);
      const href = $a.attr('href');
      const m = /\/item\/(\d+)\.html/.exec(href || '');
      if (!m) return;
      currentGroup.items.push({
        id: m[1],
        name: cleanText($a.text()),
        englishName: cleanText($a.attr('data-en') || ''),
        url: `${config.mcmodBase}/item/${m[1]}.html`,
      });
    });
  });

  // 兜底：若表格解析不到，则全局收集
  if (groups.every((g) => g.items.length === 0)) {
    const fallback = { type: '全部', items: [] };
    const seen = new Set();
    $('a[href^="/item/"]').each((_, a) => {
      const $a = $(a);
      const m = /\/item\/(\d+)\.html/.exec($a.attr('href') || '');
      if (!m) return;
      if (seen.has(m[1])) return;
      seen.add(m[1]);
      fallback.items.push({
        id: m[1],
        name: cleanText($a.text()),
        englishName: cleanText($a.attr('data-en') || ''),
        url: `${config.mcmodBase}/item/${m[1]}.html`,
      });
    });
    groups.length = 0;
    groups.push(fallback);
  }

  const totalPages = maxPageFromLinks($, (href) => /\/item\/list\/\d+-(\d+)\.html/.exec(href || ''));
  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);

  return {
    modId: Number(modId),
    modName: parsed.modName || parsed.name || null,
    modEnglishName: parsed.modEnglishName || parsed.englishName || null,
    modTag: parsed.modTag || null,
    page: Number(page),
    totalPages,
    count: totalItems,
    groups,
  };
}

/* ------------------------------------------------------------------ *
 * 小工具
 * ------------------------------------------------------------------ */
function normalizeUrl(href) {
  if (!href) return null;
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) return config.mcmodBase + href;
  return href;
}

function maxPageFromLinks($, extract) {
  let max = 1;
  $('a[href]').each((_, a) => {
    const m = extract($(a).attr('href'));
    if (m && m[1]) {
      const p = Number(m[1]);
      if (p > max) max = p;
    }
  });
  return max;
}
