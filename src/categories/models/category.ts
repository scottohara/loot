import type {
	Cacheable,
	Favouritable,
	Persistable
} from "loot/types";
import type { Category } from "categories/types";
import type { OgCacheEntry } from "og-components/og-lru-cache-factory/types";
import type OgLruCache from "og-components/og-lru-cache-factory/models/og-lru-cache";
import type OgLruCacheFactory from "og-components/og-lru-cache-factory/models/og-lru-cache-factory";

// Number of categories to keep in the LRU cache
const LRU_CAPACITY = 10;

export default class CategoryModel implements Cacheable<Category>, Favouritable<Category>, Persistable<Category> {
	public recent: OgCacheEntry[];

	public readonly LRU_LOCAL_STORAGE_KEY = "lootRecentCategories";

	public readonly type = "category";

	private readonly cache: angular.ICacheObject;

	private readonly lruCache: OgLruCache;

	public constructor(private readonly $http: angular.IHttpService,
						$cacheFactory: angular.ICacheFactoryService,
						private readonly $window: angular.IWindowService,
						ogLruCacheFactory: OgLruCacheFactory) {
		this.cache = $cacheFactory("categories");

		// Create an LRU cache and populate with the recent category list from local storage
		this.lruCache = ogLruCacheFactory.new(LRU_CAPACITY, this.recentCategories);
		this.recent = this.lruCache.list;
	}

	private get recentCategories(): OgCacheEntry[] {
		const recentCategories: string | null = this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY);

		return JSON.parse(null === recentCategories ? "[]" : recentCategories) as OgCacheEntry[];
	}

	// Returns the API path
	public path(id?: number): string {
		return `/categories${undefined === id ? "" : `/${id}`}`;
	}

	// Retrieves the list of categories
	public all(parent?: number | null, includeChildren = false): angular.IPromise<Category[]> {
		return this.$http.get(`${this.path()}${includeChildren ? "?include_children" : ""}`, {
			params: {
				parent
			},
			cache: !includeChildren && this.cache
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
			method: undefined === category.id ? "POST" : "PATCH",
			url: this.path(category.id),
			data: category
		});
	}

	// Deletes a category
	public destroy(category: Category): angular.IPromise<void> {
		// Flush the $http cache
		this.flush();

		return this.$http.delete(this.path(category.id)).then((): void => this.removeRecent(Number(category.id)));
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
		if (undefined === id) {
			this.cache.removeAll();
		} else {
			this.cache.remove(this.path(id));
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