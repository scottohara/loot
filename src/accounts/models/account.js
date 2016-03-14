{
	/**
	 * Implementation
	 */
	class AccountModel {
		constructor($http, $cacheFactory, $window, ogLruCacheFactory) {
			this.$http = $http;
			this.$window = $window;
			this.cache = $cacheFactory("accounts");

			// Create an LRU cache and populate with the recent account list from local storage
			const LRU_CAPACITY = 10;

			this.lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY)) || {});
			this.recent = this.lruCache.list();
		}

		get UNRECONCILED_ONLY_LOCAL_STORAGE_KEY() {
			return "lootUnreconciledOnly-";
		}

		get LRU_LOCAL_STORAGE_KEY() {
			return "lootRecentAccounts";
		}

		// Returns the model type
		get type() {
			return "account";
		}

		// Returns the API path
		path(id) {
			return `/accounts${id ? `/${id}` : ""}`;
		}

		// Retrieves the list of accounts
		all(includeBalances) {
			return this.$http.get(`${this.path()}${includeBalances ? "?include_balances" : ""}`, {
				cache: includeBalances ? false : this.cache
			}).then(response => response.data);
		}

		// Retrieves the list of accounts, including balances
		allWithBalances() {
			return this.all(true);
		}

		// Retrieves a single account
		find(id) {
			return this.$http.get(this.path(id), {
				cache: this.cache
			}).then(response => {
				this.addRecent(response.data);

				return response.data;
			});
		}

		// Saves an account
		save(account) {
			// Flush the $http cache
			this.flush();

			return this.$http({
				method: account.id ? "PATCH" : "POST",
				url: this.path(account.id),
				data: account
			});
		}

		// Deletes an account
		destroy(account) {
			// Flush the $http cache
			this.flush();

			return this.$http.delete(this.path(account.id)).then(() => this.removeRecent(account.id));
		}

		// Updates all pending transactions for an account to cleared
		reconcile(id) {
			return this.$http.put(`${this.path(id)}/reconcile`);
		}

		// Get the unreconciled only setting for an account from local storage
		isUnreconciledOnly(id) {
			return this.$window.localStorage.getItem(this.UNRECONCILED_ONLY_LOCAL_STORAGE_KEY + id) !== "false";
		}

		// Set the unreconciled only setting for an account in local storage
		unreconciledOnly(id, unreconciledOnly) {
			this.$window.localStorage.setItem(this.UNRECONCILED_ONLY_LOCAL_STORAGE_KEY + id, unreconciledOnly);
		}

		// Flush the cache
		flush(id) {
			if (id) {
				this.cache.remove(this.path(id));
			} else {
				this.cache.removeAll();
			}
		}

		// Put an item into the LRU cache
		addRecent(account) {
			// Put the item into the LRU cache
			this.recent = this.lruCache.put(account);

			// Update local storage with the new list
			this.$window.localStorage.setItem(this.LRU_LOCAL_STORAGE_KEY, JSON.stringify(this.lruCache.dump()));
		}

		// Remove an item from the LRU cache
		removeRecent(id) {
			// Remove the item from the LRU cache
			this.recent = this.lruCache.remove(id);

			// Update local storage with the new list
			this.$window.localStorage.setItem(this.LRU_LOCAL_STORAGE_KEY, JSON.stringify(this.lruCache.dump()));
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.service("accountModel", AccountModel);

	/**
	 * Dependencies
	 */
	AccountModel.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];
}
