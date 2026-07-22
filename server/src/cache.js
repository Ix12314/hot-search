/**
 * 极简 TTL + LRU 缓存（进程内）。
 * 避免引入额外依赖，同时减少对 mcmod.cn 的重复抓取。
 */
export class TtlCache {
  constructor(ttlSeconds = 600, maxSize = 500) {
    this.ttl = ttlSeconds * 1000;
    this.maxSize = maxSize;
    /** @type {Map<string, {value:any, expires:number}>} */
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    // 命中即"最近使用"——删后重插，保持 LRU 顺序
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    if (this.store.has(key)) this.store.delete(key);
    this.store.set(key, { value, expires: Date.now() + this.ttl });
    if (this.store.size > this.maxSize) {
      // 淘汰最旧（第一个）
      const oldest = this.store.keys().next().value;
      this.store.delete(oldest);
    }
  }

  get size() {
    return this.store.size;
  }
}
