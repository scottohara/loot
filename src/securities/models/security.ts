import {
	Cacheable,
	Favouritable,
	Persistable
} from "loot/types";
import OgLruCacheFactory, {OgLruCache} from "og-components/og-lru-cache-factory/models/og-lru-cache-factory";
import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";
import {Security} from "securities/types";
import {StoredAccountType} from "accounts/types";
import {Transaction} from "transactions/types";

// Number of securities to keep in the LRU cache
const LRU_CAPACITY = 10;

export default class SecurityModel implements Cacheable<Security>, Favouritable<Security>, Persistable<Security> {
	public recent: OgCacheEntry[];

	private readonly cache: angular.ICacheObject;

	private readonly lruCache: OgLruCache;

	public constructor(private readonly $http: angular.IHttpService, $cacheFactory: angular.ICacheFactoryService,
											private readonly $window: angular.IWindowService, ogLruCacheFactory: OgLruCacheFactory) {
		this.cache = $cacheFactory("securities");

		// Create an LRU cache and populate with the recent payee list from local storage
		this.lruCache = ogLruCacheFactory.new(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY) || "[]") as OgCacheEntry[]);
		this.recent = this.lruCache.list;
	}

	public get LRU_LOCAL_STORAGE_KEY(): string {
		return "lootRecentSecurities";
	}

	// Returns the model type
	public get type(): string {
		return "security";
	}

	// Returns the API path
	public path(id?: number): string {
		return `/securities${id ? `/${id}` : ""}`;
	}

	// Retrieves the list of securities
	public all(includeBalances?: boolean): angular.IPromise<Security[]> {
		return this.$http.get(`${this.path()}${includeBalances ? "?include_balances" : ""}`, {
			cache: includeBalances ? false : this.cache
		}).then((response: angular.IHttpResponse<Security[]>): Security[] => response.data);
	}

	// Retrieves the list of securities, including balances
	public allWithBalances(): angular.IPromise<Security[]> {
		return this.all(true);
	}

	// Retrieves the most recent transaction for a security
	public findLastTransaction(securityId: number, accountType: StoredAccountType): angular.IPromise<Transaction> {
		return this.$http.get(`${this.path(securityId)}/transactions/last`, {
			params: {
				account_type: accountType
			}
		}).then((response: angular.IHttpResponse<Transaction>): Transaction => response.data);
	}

	// Retrieves a single security
	public find(id: number): angular.IPromise<Security> {
		return this.$http.get(this.path(id), {
			cache: this.cache
		}).then((response: angular.IHttpResponse<Security>): Security => {
			this.addRecent(response.data);

			return response.data;
		});
	}

	// Saves a security
	public save(security: Security): angular.IHttpPromise<Security> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: security.id ? "PATCH" : "POST",
			url: this.path(security.id),
			data: security
		});
	}

	// Deletes a security
	public destroy(security: Security): angular.IPromise<void> {
		// Flush the $http cache
		this.flush();

		return this.$http.delete(this.path(security.id)).then((): void => this.removeRecent(security.id));
	}

	// Favourites/unfavourites a security
	public toggleFavourite(security: Security): angular.IPromise<boolean> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: security.favourite ? "DELETE" : "PUT",
			url: `${this.path(security.id)}/favourite`
		}).then((): boolean => !security.favourite);
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
	public addRecent(security: Security): void {
		// Put the item into the LRU cache
		this.recent = this.lruCache.put(security);

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

SecurityModel.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];