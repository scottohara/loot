import {
	Cacheable,
	Favouritable,
	Persistable
} from "loot/types";
import {Category} from "categories/types";
import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";
import OgLruCache from "og-components/og-lru-cache-factory/models/og-lru-cache";
import OgLruCacheFactory from "og-components/og-lru-cache-factory/models/og-lru-cache-factory";

// Number of categories to keep in the LRU cache
const LRU_CAPACITY = 10;

export default class CategoryModel implements Cacheable<Category>, Favouritable<Category>, Persistable<Category> {
	public recent: OgCacheEntry[];

	private readonly cache: angular.ICacheObject;

	private readonly lruCache: OgLruCache;

	public constructor(private readonly $http: angular.IHttpService, $cacheFactory: angular.ICacheFactoryService,
						private readonly $window: angular.IWindowService, ogLruCacheFactory: OgLruCacheFactory) {
		this.cache = $cacheFactory("categories");

		// Create an LRU cache and populate with the recent category list from local storage
		this.lruCache = ogLruCacheFactory.new(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY) || "[]") as OgCacheEntry[]);
		this.recent = this.lruCache.list;
	}

	public get LRU_LOCAL_STORAGE_KEY(): string {
		return "lootRecentCategories";
	}

	// Returns the model type
	public get type(): string {
		return "category";
	}

	// Returns the API path
	public path(id?: number): string {
		return `/categories${id ? `/${id}` : ""}`;
	}

	// Retrieves the list of categories
	public all(parent?: number | null, includeChildren?: boolean): angular.IPromise<Category[]> {
		return this.$http.get(`${this.path()}${includeChildren ? "?include_children" : ""}`, {
			params: {
				parent
			},
			cache: includeChildren ? false : this.cache
		}).then((response: angular.IHttpResponse<Category[]>): Category[] => response.data);
	}

	// Retrieves the list of categories, including children
	public allWithChildren(parent?: number): angular.IPromise<Category[]> {
		return this.all(parent, true);
	}

	// Retrieves a single category
	public find(id: number): angular.IPromise<Category> {
		return this.$http.get(this.path(id), {
			cache: this.cache
		}).then((response: angular.IHttpResponse<Category>): Category => {
			this.addRecent(response.data);

			return response.data;
		});
	}

	// Saves a category
	public save(category: Category): angular.IHttpPromise<Category> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: category.id ? "PATCH" : "POST",
			url: this.path(category.id),
			data: category
		});
	}

	// Deletes a category
	public destroy(category: Category): angular.IPromise<void> {
		// Flush the $http cache
		this.flush();

		return this.$http.delete(this.path(category.id)).then((): void => this.removeRecent(category.id));
	}

	// Favourites/unfavourites a category
	public toggleFavourite(category: Category): angular.IPromise<boolean> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: category.favourite ? "DELETE" : "PUT",
			url: `${this.path(category.id)}/favourite`
		}).then((): boolean => !category.favourite);
	}

	// Flush the cache
	public flush(id?: number): void {
		if (id) {
			this.cache.remove(this.path(id));
		} else {
			this.cache.removeAll();
		}
	}

	// Put an item into the LRU cache
	public addRecent(category: Category): void {
		// Put the item into the LRU cache
		this.recent = this.lruCache.put(category);

		// Update local storage with the new list
		this.$window.localStorage.setItem(this.LRU_LOCAL_STORAGE_KEY, JSON.stringify(this.lruCache.list));
	}

	// Remove an item from the LRU cache
	public removeRecent(id: number): void {
		// Remove the item from the LRU cache
		this.recent = this.lruCache.remove(id);

		// Update local storage with the new list
		this.$window.localStorage.setItem(this.LRU_LOCAL_STORAGE_KEY, JSON.stringify(this.lruCache.list));
	}
}

CategoryModel.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];