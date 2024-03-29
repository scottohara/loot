import type { Account, Accounts } from "~/accounts/types";
import type { Cacheable, Favouritable, Persistable } from "~/loot/types";
import type { OgCacheEntry } from "~/og-components/og-lru-cache-factory/types";
import type OgLruCache from "~/og-components/og-lru-cache-factory/models/og-lru-cache";
import type OgLruCacheFactory from "~/og-components/og-lru-cache-factory/models/og-lru-cache-factory";

// Number of accounts to keep in the LRU cache
const LRU_CAPACITY = 10;

export default class AccountModel
	implements Cacheable<Account>, Favouritable<Account>, Persistable<Account>
{
	public recent: OgCacheEntry[];

	public readonly LRU_LOCAL_STORAGE_KEY = "lootRecentAccounts";

	public readonly type = "account";

	private readonly cache: angular.ICacheObject;

	private readonly lruCache: OgLruCache;

	private readonly UNRECONCILED_ONLY_LOCAL_STORAGE_KEY =
		"lootUnreconciledOnly-";

	public constructor(
		private readonly $http: angular.IHttpService,
		$cacheFactory: angular.ICacheFactoryService,
		private readonly $window: angular.IWindowService,
		ogLruCacheFactory: OgLruCacheFactory,
	) {
		// Angular HTTP cache for accounts
		this.cache = $cacheFactory("accounts");

		// Create an LRU cache and populate with the recent account list from local storage
		this.lruCache = ogLruCacheFactory.new(LRU_CAPACITY, this.recentAccounts);
		this.recent = this.lruCache.list;
	}

	private get recentAccounts(): OgCacheEntry[] {
		const recentAccounts: string | null = this.$window.localStorage.getItem(
			this.LRU_LOCAL_STORAGE_KEY,
		);

		return JSON.parse(recentAccounts ?? "[]") as OgCacheEntry[];
	}

	// Returns the API path
	public path(id?: number): string {
		return `/accounts${undefined === id ? "" : `/${id}`}`;
	}

	// Retrieves the list of accounts
	public all(includeBalances = false): angular.IPromise<Account[] | Accounts> {
		return this.$http
			.get(`${this.path()}${includeBalances ? "?include_balances" : ""}`, {
				cache: !includeBalances && this.cache,
			})
			.then(
				(
					response: angular.IHttpResponse<Account[] | Accounts>,
				): Account[] | Accounts => response.data,
			);
	}

	// Retrieves the list of accounts, including balances
	public allWithBalances(): angular.IPromise<Accounts> {
		return this.all(true) as angular.IPromise<Accounts>;
	}

	// Retrieves a single account
	public find(id: number): angular.IPromise<Account> {
		return this.$http
			.get(this.path(id), {
				cache: this.cache,
			})
			.then((response: angular.IHttpResponse<Account>): Account => {
				this.addRecent(response.data);

				return response.data;
			});
	}

	// Saves an account
	public save(account: Account): angular.IHttpPromise<Account> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: undefined === account.id ? "POST" : "PATCH",
			url: this.path(account.id),
			data: account,
		});
	}

	// Deletes an account
	public destroy(account: Account): angular.IPromise<void> {
		// Flush the $http cache
		this.flush();

		return this.$http
			.delete(this.path(account.id))
			.then((): void => this.removeRecent(Number(account.id)));
	}

	// Updates all pending transactions for an account to cleared
	public reconcile(id: number): angular.IHttpPromise<void> {
		return this.$http.put(`${this.path(id)}/reconcile`, null);
	}

	// Favourites/unfavourites an account
	public toggleFavourite(account: Account): angular.IPromise<boolean> {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: account.favourite ? "DELETE" : "PUT",
			url: `${this.path(account.id)}/favourite`,
		}).then((): boolean => !account.favourite);
	}

	// Get the unreconciled only setting for an account from local storage
	public isUnreconciledOnly(id: number): boolean {
		return (
			this.$window.localStorage.getItem(
				`${this.UNRECONCILED_ONLY_LOCAL_STORAGE_KEY}${id}`,
			) !== "false"
		);
	}

	// Set the unreconciled only setting for an account in local storage
	public unreconciledOnly(id: number, unreconciledOnly: boolean): void {
		this.$window.localStorage.setItem(
			`${this.UNRECONCILED_ONLY_LOCAL_STORAGE_KEY}${id}`,
			String(unreconciledOnly),
		);
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
	public addRecent(account: Account): void {
		// Put the item into the LRU cache
		this.recent = this.lruCache.put(account);

		// Update local storage with the new list
		this.$window.localStorage.setItem(
			this.LRU_LOCAL_STORAGE_KEY,
			JSON.stringify(this.lruCache.list),
		);
	}

	// Remove an item from the LRU cache
	public removeRecent(id: number): void {
		// Remove the item from the LRU cache
		this.recent = this.lruCache.remove(id);

		// Update local storage with the new list
		this.$window.localStorage.setItem(
			this.LRU_LOCAL_STORAGE_KEY,
			JSON.stringify(this.lruCache.list),
		);
	}
}

AccountModel.$inject = [
	"$http",
	"$cacheFactory",
	"$window",
	"ogLruCacheFactory",
];
