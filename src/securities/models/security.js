export default class SecurityModel {
	constructor($http, $cacheFactory, $window, ogLruCacheFactory) {
		this.$http = $http;
		this.$window = $window;
		this.cache = $cacheFactory("securities");

		// Create an LRU cache and populate with the recent account list from local storage
		const LRU_CAPACITY = 10;

		this.lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY)) || {});
		this.recent = this.lruCache.list();
	}

	get LRU_LOCAL_STORAGE_KEY() {
		return "lootRecentSecurities";
	}

	// Returns the model type
	get type() {
		return "security";
	}

	// Returns the API path
	path(id) {
		return `/securities${id ? `/${id}` : ""}`;
	}

	// Retrieves the list of securities
	all(includeBalances) {
		return this.$http.get(`${this.path()}${includeBalances ? "?include_balances" : ""}`, {
			cache: includeBalances ? false : this.cache
		}).then(response => response.data);
	}

	// Retrieves the list of securities, including balances
	allWithBalances() {
		return this.all(true);
	}

	// Retrieves the most recent transaction for a security
	findLastTransaction(securityId, accountType) {
		return this.$http.get(`${this.path(securityId)}/transactions/last`, {
			params: {
				account_type: accountType
			}
		}).then(response => response.data);
	}

	// Retrieves a single security
	find(id) {
		return this.$http.get(this.path(id), {
			cache: this.cache
		}).then(response => {
			this.addRecent(response.data);

			return response.data;
		});
	}

	// Saves a security
	save(security) {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: security.id ? "PATCH" : "POST",
			url: this.path(security.id),
			data: security
		});
	}

	// Deletes a security
	destroy(security) {
		// Flush the $http cache
		this.flush();

		return this.$http.delete(this.path(security.id)).then(() => this.removeRecent(security.id));
	}

	// Favourites/unfavourites a security
	toggleFavourite(security) {
		// Flush the $http cache
		this.flush();

		return this.$http({
			method: security.favourite ? "DELETE" : "PUT",
			url: `${this.path(security.id)}/favourite`
		}).then(() => !security.favourite);
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
	addRecent(security) {
		// Put the item into the LRU cache
		this.recent = this.lruCache.put(security);

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

SecurityModel.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];