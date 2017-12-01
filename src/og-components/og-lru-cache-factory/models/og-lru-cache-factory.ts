import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";

// Cache object
export class OgLruCache {
	public constructor(private capacity: number, private items: OgCacheEntry[]) {}

	// Put an item into the cache
	public put(item: OgCacheEntry): OgCacheEntry[] {
		// Exit early if the item is already the current head
		if (this.items.length > 0 && this.items[0].id === item.id) {
			return this.items;
		}

		this.items = [item, ...this.remove(item.id)].slice(0, this.capacity);

		return this.list;
	}

	// Remove an item from the cache
	public remove(id: number): OgCacheEntry[] {
		// Check if the item is in the cache
		const index = this.items.findIndex((item): boolean => item.id === id);

		if (index !== -1) {
			// Remove the item
			this.items.splice(index, 1);
		}

		return this.list;
	}

	// List the cached items in order (MRU)
	public get list(): OgCacheEntry[] {
		return this.items;
	}
}

// Factory function to return a new LruCache object with the specified capacity
export default class OgLruCacheFactory {
	public new(capacity: number, data: OgCacheEntry[]): OgLruCache {
		return new OgLruCache(capacity, data.slice(0, capacity));
	}
}

OgLruCacheFactory.$inject = [];