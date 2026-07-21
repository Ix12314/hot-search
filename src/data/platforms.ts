export type PlatformId =
  | "weibo"
  | "zhihu"
  | "bilibili"
  | "douyin"
  | "kuaishou"
  | "baidu"
  | "toutiao"
  | "wangyi"
  | "douyu"
  | "tieba";

export interface Platform {
  id: PlatformId;
  name: string;
  shortName: string;
  category: "social" | "video" | "search" | "community" | "live";
  color: string;
  /** Tailwind色板用 brand-{id}，需要单独处理 inline style */
  description: string;
  apiType: string;
  homepage: string;
  /** 短英文标签用于徽章 */
  badge: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "weibo",
    name: "微博热搜",
    shortName: "微博",
    category: "social",
    color: "#E6162D",
    description: "新浪微博实时热搜榜单",
    apiType: "weibo",
    homepage: "https://s.weibo.com/top/summary",
    badge: "WB",
  },
  {
    id: "zhihu",
    name: "知乎热榜",
    shortName: "知乎",
    category: "community",
    color: "#0084FF",
    description: "知乎热门话题榜",
    apiType: "zhihu",
    homepage: "https://www.zhihu.com/hot",
    badge: "ZH",
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    shortName: "B站",
    category: "video",
    color: "#FB7299",
    description: "哔哩哔哩综合热门",
    apiType: "bilibili",
    homepage: "https://www.bilibili.com/v/popular/all",
    badge: "BL",
  },
  {
    id: "douyin",
    name: "抖音热点",
    shortName: "抖音",
    category: "video",
    color: "#161823",
    description: "抖音实时热榜",
    apiType: "douyin",
    homepage: "https://www.douyin.com/hot",
    badge: "DY",
  },
  {
    id: "kuaishou",
    name: "快手热榜",
    shortName: "快手",
    category: "video",
    color: "#FF4906",
    description: "快手实时热榜",
    apiType: "kuaishou",
    homepage: "https://www.kuaishou.com/",
    badge: "KS",
  },
  {
    id: "baidu",
    name: "百度热搜",
    shortName: "百度",
    category: "search",
    color: "#2932E1",
    description: "百度热搜实时榜单",
    apiType: "baidu",
    homepage: "https://top.baidu.com/board?tab=realtime",
    badge: "BD",
  },
  {
    id: "toutiao",
    name: "头条热榜",
    shortName: "头条",
    category: "social",
    color: "#F04142",
    description: "今日头条实时热榜",
    apiType: "toutiao",
    homepage: "https://www.toutiao.com/hot-event/hot-board/",
    badge: "TT",
  },
  {
    id: "wangyi",
    name: "网易热榜",
    shortName: "网易",
    category: "social",
    color: "#CC292D",
    description: "网易新闻热点榜",
    apiType: "wangyi",
    homepage: "https://m.163.com/qq/",
    badge: "WY",
  },
  {
    id: "douyu",
    name: "斗鱼热榜",
    shortName: "斗鱼",
    category: "live",
    color: "#FF7700",
    description: "斗鱼直播热度榜",
    apiType: "douyu",
    homepage: "https://www.douyu.com/directory/rank_list/game",
    badge: "DY2",
  },
  {
    id: "tieba",
    name: "贴吧热议",
    shortName: "贴吧",
    category: "community",
    color: "#4E6EF2",
    description: "百度贴吧热议榜",
    apiType: "tieba",
    homepage: "https://tieba.baidu.com/hottopic/browse/topicList",
    badge: "TB",
  },
];

export const PLATFORM_MAP: Record<PlatformId, Platform> = PLATFORMS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<PlatformId, Platform>
);

export const PLATFORM_CATEGORY_LABEL: Record<Platform["category"], string> = {
  social: "社交平台",
  video: "视频平台",
  search: "搜索引擎",
  community: "社区论坛",
  live: "直播平台",
};
