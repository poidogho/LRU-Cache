/**
 * A Least Recently Used (LRU) cache with Time-to-Live (TTL) support. Items are kept in the cache until they either
 * reach their TTL or the cache reaches its size and/or item limit. When the limit is exceeded, the cache evicts the
 * item that was least recently accessed (based on the timestamp of access). Items are also automatically evicted if they
 * are expired, as determined by the TTL.
 * An item is considered accessed, and its last accessed timestamp is updated, whenever `has`, `get`, or `set` is called with its key.
 *
 * Implement the LRU cache provider here and use the lru-cache.test.ts to check your implementation.
 * You're encouraged to add additional functions that make working with the cache easier for consumers.
 */

type LRUCacheProviderOptions = {
  ttl: number; // Time to live in milliseconds
  itemLimit: number;
};
type TLRUCacheProvider<T> = {
  has: (key: string) => boolean;
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => void;
};

type CacheItem<T> = {
  value: T;
  timestamp: number;
};

// TODO: Implement LRU cache provider

export function createLRUCacheProvider<T>({
  ttl,
  itemLimit,
}: LRUCacheProviderOptions): TLRUCacheProvider<T> {
  let cache = new Map<string, CacheItem<T>>();

  const isExpired = (key: string): boolean => {
    const now = Date.now();
    const item = cache.get(key);
    return item !== undefined && now - item?.timestamp > ttl;
  };

  return {
    has: (key: string) => {
      if (!cache.has(key) || isExpired(key)) {
        cache.delete(key);
        return false;
      }
      return true;
    },
    get: (key: string) => {
      if (!cache.has(key) || isExpired(key)) {
        cache.delete(key);
        return undefined;
      }
      const item = cache.get(key)!;
      item.timestamp = Date.now();
      cache.delete(key);
      cache.set(key, item);
      return item?.value;
    },
    set: (key: string, value: T) => {
      cache.set(key, { value, timestamp: Date.now() });
    },
  };
}
