import type { PlatformId } from "./platforms";

export interface HotSearchItem {
  id: string;
  title: string;
  /** 描述/副标题 */
  desc?: string;
  /** 热度值（原始数值字符串） */
  hot: number;
  /** 格式化后的热度展示 */
  hotLabel: string;
  url: string;
  /** 排名 */
  index: number;
  /** 标签：新/热/沸等 */
  tag?: string;
  /** 缩略图 */
  cover?: string;
}

export interface PlatformHotList {
  platformId: PlatformId;
  platformName: string;
  subtitle: string;
  source: string;
  updatedAt: string;
  total: number;
  items: HotSearchItem[];
}

export type DataSource = "live" | "demo";

export interface FetchResult {
  data: PlatformHotList;
  source: DataSource;
}
