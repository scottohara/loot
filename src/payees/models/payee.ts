import {
	Cacheable,
	Favouritable,
	Persistable
} from "loot/types";
import OgLruCacheFactory, {OgLruCache} from "og-components/og-lru-cache-factory/models/og-lru-cache-factory";
import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";
import {Payee} from "payees/types";
import {StoredAccountType} from "accounts/types";
import {Transaction} from "transactions/types";

// Number of payees to keep in the LRU cache
const LRU_CAPACITY = 10;

export default class PayeeModel implements Cacheable<Payee>, Favouritable<Payee>, Persistable<Payee> {
	public recent: OgCacheEntry[];

	private readonly cache: angular.ICacheObject;

	private readonly lruCache: OgLruCache;

	public constructor(private readonly $http: angular.IHttpService, $cacheFactory: angular.ICacheFactoryService,
											private readonly $window: angular.IWindowService, ogLruCacheFactory: OgLruCacheFactory) {
		this.cache = $cacheFactory("payees");

		// Create an LRU cache and populate with the recent payee list from local storage
		this.lruCache = ogLruCacheFactory.new(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY) || "[]") as OgCacheEntry[]);
		this.recent = this.lruCache.list;
	}

	public get LRU_LOCAL_STORAGE_KEY(): string {
		return "lootRecentPayees";
	}

	// Returns the model type
	public get type(): string {
		return "payee";
	}

	// Returns the API path
	public path(id?: number): string {
		return `/payees${id ? `/${id}` : ""}`;
	}

	// Retrieves the list of payees
	public all(list?: boolean): angular.IPromise<Payee[]> {
		return this.$http.get(`${this.path()}${list ? "?list" : ""}`, {
			cache: list ? false : this.cache
		}).then((response: angular.IHttpResponse<Payee[]>): Payee[] => response.data);
	}

	// Retrieves the list of payees for the index list
	public allList(): angular.IPromise<Payee[]> {
		return this.all(true);
	}

	// Retrieves the most recent transaction for a payee
	public findLastTransaction(payeeId: number, accountType: StoredAccountType): angular.IPromise<Transaction> {
		return this.$http.get(`${this.path(payeeId)}/transactions/last`, {
			params: {
				account_type: accountType
			}
		}).then((response: angular.IHttpResponse<Transaction>): Transaction => response.data);
	}

	// Retrieves a single payee
	public find(id: number): angular.IPromise<Payee> {
		return this.$http.get(this.path(id), {
			cache: this.cache
		}).then((response: angular.IHttpResponse<Payee>): Payee => {
			this.addRecent(response.data);

			return response.data;
		});
	}

	// Saves a payee
	public save(payee: Payee): angular.IHttpPromise<Payee> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: payee.id ? "PATCH" : "POST",
			url: this.path(payee.id),
			data: payee
		});
	}

	// Deletes a payee
	public destroy(payee: Payee): angular.IPromise<void> {
		// Flush the $http cache
		this.flush();

		return this.$http.delete(this.path(payee.id)).then((): void => this.removeRecent(payee.id));
	}

	// Favourites/unfavourites a payee
	public toggleFavourite(payee: Payee): angular.IPromise<boolean> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: payee.favourite ? "DELETE" : "PUT",
			url: `${this.path(payee.id)}/favourite`
		}).then((): boolean => !payee.favourite);
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
	public addRecent(payee: Payee): void {
		// Put the item into the LRU cache
		this.recent = this.lruCache.put(payee);

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

PayeeModel.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];