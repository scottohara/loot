{
	/**
	 * Implementation
	 */
	class CategoryModel {
		constructor($http, $cacheFactory, $window, ogLruCacheFactory) {
			this.$http = $http;
			this.$window = $window;
			this.cache = $cacheFactory("categories");

			// Create an LRU cache and populate with the recent account list from local storage
			const LRU_CAPACITY = 10;

			this.lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse(this.$window.localStorage.getItem(this.LRU_LOCAL_STORAGE_KEY)) || {});
			this.recent = this.lruCache.list();
		}

		get LRU_LOCAL_STORAGE_KEY() {
			return "lootRecentCategories";
		}

		// Returns the model type
		get type() {
			return "category";
		}

		// Returns the API path
		path(id) {
			return `/categories${id ? `/${id}` : ""}`;
		}

		// Retrieves the list of categories
		all(parent, includeChildren) {
			return this.$http.get(`${this.path()}${includeChildren ? "?include_children" : ""}`, {
				params: {
					parent
				},
				cache: includeChildren ? false : this.cache
			}).then(response => response.data);
		}

		// Retrieves the list of categories, including children
		allWithChildren(parent) {
			return this.all(parent, true);
		}

		// Retrieves a single category
		find(id) {
			return this.$http.get(this.path(id), {
				cache: this.cache
			}).then(response => {
				this.addRecent(response.data);
				return response.data;
			});
		}

		// Saves a category
		save(category) {
			// Flush the $http cache
			this.flush();

			return this.$http({
				method: category.id ? "PATCH" : "POST",
				url: this.path(category.id),
				data: category
			});
		}

		// Deletes a category
		destroy(category) {
			// Flush the $http cache
			this.flush();

			return this.$http.delete(this.path(category.id)).then(() => this.removeRecent(category.id));
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
		addRecent(category) {
			// Put the item into the LRU cache
			this.recent = this.lruCache.put(category);

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
		.module("lootCategories")
		.service("categoryModel", CategoryModel);

	/**
	 * Dependencies
	 */
	CategoryModel.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];
}
