import { createLRUCacheProvider } from '../src/dao/caches/lru-cache.js';

const sleep = (timeoutInMS: number) =>
  new Promise((resolve) => setTimeout(resolve, timeoutInMS));

describe('has', () => {
  it('should return false for non-existent key', () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 10,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    expect(lruCache.has('bar')).toEqual(false);
    expect(lruCache.has('')).toEqual(false);
  });
  it('should return false for expired key', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 1,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('baz', 'bar');
    expect(lruCache.has('foo')).toEqual(false);
    expect(lruCache.has('baz')).toEqual(true);
  });
  it('should remove least recently used key on item limit', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 2,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('bar', 'bar');
    await sleep(5);
    lruCache.get('foo');
    lruCache.set('baz', 'bar');
    expect(lruCache.has('foo')).toEqual(true);
    expect(lruCache.has('bar')).toEqual(false);
    expect(lruCache.has('baz')).toEqual(true);
  });
  it('should return true for recreated key after expiration', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 1,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('baz', 'bar');
    lruCache.set('foo', 'bar');
    expect(lruCache.has('foo')).toEqual(true);
  });
  it('should return true for existing keys', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 10,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('baz', 'bar');
    expect(lruCache.has('foo')).toEqual(true);
    expect(lruCache.has('baz')).toEqual(true);
  });
});

describe('get', () => {
  it('should return undefined for non-existent key', () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 10,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    expect(lruCache.get('bar')).toBeUndefined();
    expect(lruCache.get('')).toBeUndefined();
  });
  it('should return undefined for expired key', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 1,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('baz', 'bar');
    expect(lruCache.get('foo')).toBeUndefined();
    expect(lruCache.get('baz')).toEqual('bar');
  });
  it('should remove least recently used key on item limit', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 2,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('bar', 'bar');
    await sleep(5);
    lruCache.get('foo');
    lruCache.set('baz', 'bar');
    expect(lruCache.get('foo')).toEqual('bar');
    expect(lruCache.get('bar')).toBeUndefined();
    expect(lruCache.get('baz')).toEqual('bar');
  });
  it('should return true for recreated key after expiration', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 1,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('baz', 'bar');
    lruCache.set('foo', 'bar');
    expect(lruCache.get('foo')).toEqual('bar');
    expect(lruCache.get('baz')).toBeUndefined();
  });
  it('should return value for existing keys', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 10,
      ttl: 50000,
    });
    lruCache.set('foo', 'foo');
    lruCache.set('baz', 'baz');
    expect(lruCache.get('foo')).toEqual('foo');
    expect(lruCache.get('baz')).toEqual('baz');
  });
});

describe('set', () => {
  it('should set record in cache', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 10,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    expect(lruCache.get('foo')).toEqual('bar');
  });
  it('should overwrite previous record in cache with the same key', async () => {
    const lruCache = createLRUCacheProvider<string>({
      itemLimit: 10,
      ttl: 50000,
    });
    lruCache.set('foo', 'bar');
    lruCache.set('foo', 'baz');
    expect(lruCache.get('foo')).toEqual('baz');
  });
});

describe('TTL behavior', () => {
  it('should evict item after TTL expires', async () => {
    const ttl = 100; // 100 ms TTL
    const lruCache = createLRUCacheProvider<string>({ itemLimit: 2, ttl });
    lruCache.set('key1', 'value1');
    await sleep(ttl + 10); // Wait for TTL to expire
    expect(lruCache.get('key1')).toBeUndefined();
  });

  it('should refresh TTL on access', async () => {
    const ttl = 100; // 100 ms TTL
    const lruCache = createLRUCacheProvider<string>({ itemLimit: 2, ttl });
    lruCache.set('key1', 'value1');
    await sleep(50); // Access before TTL expires
    expect(lruCache.get('key1')).toEqual('value1');
    await sleep(60); // Total wait less than 2*TTL
    expect(lruCache.get('key1')).toEqual('value1'); // Should still be valid
  });

  it('should evict only expired items when reaching item limit', async () => {
    const ttl = 100; // 100 ms TTL
    const lruCache = createLRUCacheProvider<string>({ itemLimit: 2, ttl });
    lruCache.set('key1', 'value1');
    await sleep(ttl + 10); // Wait for key1 to expire
    lruCache.set('key2', 'value2');
    lruCache.set('key3', 'value3'); // Should evict key1, but not key2
    expect(lruCache.get('key1')).toBeUndefined();
    expect(lruCache.get('key2')).toEqual('value2');
    expect(lruCache.get('key3')).toEqual('value3');
  });
});
