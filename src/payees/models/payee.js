{
	/**
	 * Implementation
	 */
	class Factory {
		constructor($http, $cacheFactory, $window, ogLruCacheFactory) {
			this.$http = $http;
			this.$window = $window;
			this.cache = $cacheFactory("payees");

			// Create an LRU cache and populate with the recent account list from local storage
			const LRU_CAPACITY = 10;

			this.lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY)) || {});
			this.recent = this.lruCache.list();
		}

		get LRU_LOCAL_STORAGE_KEY() {
			return "lootRecentPayees";
		}

		// Returns the model type
		get type() {
			return "payee";
		}

		// Returns the API path
		path(id) {
			return `/payees${id ? `/${id}` : ""}`;
		}

		// Retrieves the list of payees
		all() {
			return this.$http.get(this.path(), {
				cache: this.cache
			}).then(response => response.data);
		}

		// Retrieves the most recent transaction for a payee
		findLastTransaction(payeeId, accountType) {
			return this.$http.get(`${this.path(payeeId)}/transactions/last`, {
				params: {
					account_type: accountType
				}
			}).then(response => response.data);
		}

		// Retrieves a single payee
		find(id) {
			return this.$http.get(this.path(id), {
				cache: this.cache
			}).then(response => {
				this.addRecent(response.data);
				return response.data;
			});
		}

		// Saves a payee
		save(payee) {
			// Flush the $http cache
			this.flush();

			return this.$http({
				method: payee.id ? "PATCH" : "POST",
				url: this.path(payee.id),
				data: payee
			});
		}

		// Deletes a payee
		destroy(payee) {
			// Flush the $http cache
			this.flush();

			return this.$http.delete(this.path(payee.id)).then(() => this.removeRecent(payee.id));
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
		addRecent(payee) {
			// Put the item into the LRU cache
			this.recent = this.lruCache.put(payee);

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

		static factory($http, $cacheFactory, $window, ogLruCacheFactory) {
			return new Factory($http, $cacheFactory, $window, ogLruCacheFactory);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootPayees")
		.factory("payeeModel", Factory.factory);

	/**
	 * Dependencies
	 */
	Factory.factory.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];
}
