import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";
import OgLruCache from "og-components/og-lru-cache-factory/models/og-lru-cache";

export default class OgLruCacheFactory {
	public new(capacity: number, data: OgCacheEntry[]): OgLruCache {
		return new OgLruCache(capacity, data.slice(0, capacity));
	}
}

OgLruCacheFactory.$inject = [];