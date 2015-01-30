(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogLruCacheFactory model
	mod.factory("ogLruCacheFactory", [
		function() {
			// Cache object
			var	LruCache = function(capacity, data) {
				this.capacity = capacity;
				this.head = data.head;
				this.tail = data.tail;
				this.items = data.items || {};

				// Check if the cache has exceeded it's capacity
				this.checkCapacity();
			};

			// Put an item into the cache
			LruCache.prototype.put = function(item) {
				var	oldHead = this.items[this.head],
						newHead;

				// Only update if the item is not already the current head
				if (String(item.id) !== String(this.head)) {
					// Check if the item already exists
					if (this.items.hasOwnProperty(item.id)) {
						// New head is the existing item
						newHead = this.items[item.id];
						
						// Unlink the existing item from the list
						if (String(item.id) !== String(this.tail)) {
							this.items[newHead.older].newer = newHead.newer;
						} else {
							this.tail = newHead.newer;
						}
						this.items[newHead.newer].older = newHead.older;

						// Link the old head to the new head
						oldHead.newer = item.id;
						newHead.older = this.head;
						newHead.newer = null;

						// Update the header pointer
						this.head = item.id;
					} else {
						newHead = {
							id: item.id,
							name: item.name
						};
						
						// Link the old head to the new head
						if (oldHead) {
							oldHead.newer = item.id;
							newHead.older = this.head;
						} else {
							// This must be the first item in the cache, so must be both head and tail
							this.tail = item.id;
						}

						// Add the new item to the cache
						this.items[item.id] = newHead;

						// Update the head pointer
						this.head = item.id;

						// Check if the cache has exceeded it's capacity
						this.checkCapacity();
					}
				}

				// Return the list of cached items in order (MRU)
				return this.list();
			};

			// Remove an item from the cache
			LruCache.prototype.remove = function(id) {
				// Check if the item is in the cache
				if (this.items.hasOwnProperty(id)) {
					if (String(id) === String(this.head)) {
						// Item to remove is the current head. If there's an older item, make it the new head
						this.head = this.items[this.head].older;
						if (this.head) {
							this.items[this.head].newer = null;
						} else {
							// Must have been the only item in the cache, so clear the tail as well
							this.tail = null;
						}
					} else if (String(id) === String(this.tail)) {
						// Item to remove is the current tail. Make the next newer item the new tail
						this.tail = this.items[this.tail].newer;
						this.items[this.tail].older = null;
					} else {
						// Item to remove is somewhere in the middle.  Link the newer and older items.
						var itemToRemove = this.items[id];
						this.items[itemToRemove.newer].older = itemToRemove.older;
						this.items[itemToRemove.older].newer = itemToRemove.newer;
					}

					// Remove the item from the cache
					delete this.items[id];
				}

				// Return the list of cached items in order (MRU)
				return this.list();
			};

			// Check if the cache has exceeded it's capacity and trim as necessary
			LruCache.prototype.checkCapacity = function() {
				while (Object.keys(this.items).length > this.capacity) {
					var	oldTail = this.items[this.tail],
							newTail;
					
					// Update the tail pointer
					this.tail = oldTail.newer;

					// Delete the old tail
					newTail = this.items[oldTail.newer];
					delete this.items[newTail.older];
					
					// Unlink the old tail from the list
					newTail.older = null;
				}
			};

			// List the cached items in order (MRU)
			LruCache.prototype.list = function() {
				var list = [],
						item = this.items[this.head],
						iterations = 0;

				while (item) {
					iterations++;

					// Safety check
					if (iterations > this.capacity) {
						// Something is wrong, we've iterated more times than the cache capacity allows
						throw new Error("Possible infinite loop in LRU cache. Head: " + this.head + ", Tail: " + this.tail + ", Item: " + JSON.stringify(item) + ", Items: " + JSON.stringify(this.items));
					}

					list.push({
						id: item.id,
						name: item.name
					});

					item = this.items[item.older];
				}

				return list;
			};

			// Dump the cache internals (for persisting to storage)
			LruCache.prototype.dump = function() {
				return {
					head: this.head,
					tail: this.tail,
					items: this.items
				};
			};

			// Factory function
			return function(capacity, data) {
				// Return a new LruCache object with the specified capacity
				return new LruCache(capacity, data);
			};
		}
	]);
})();
