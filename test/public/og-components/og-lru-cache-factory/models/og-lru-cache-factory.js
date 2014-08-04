(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogLruCacheFactory", function() {
		// The object under test
		var ogLruCacheFactory;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Inject the object under test
		beforeEach(inject(function(_ogLruCacheFactory_) {
			ogLruCacheFactory = _ogLruCacheFactory_;
		}));

		it ("should return a factory for creating new LruCache object", function() {
			ogLruCacheFactory.should.be.a.function;
		});

		describe("factory", function() {
			var ogLruCache;

			it("should return an LruCache", function() {
				ogLruCacheFactory(10, {}).should.be.an.Object;
			});

			describe("LruCache (empty)", function() {
				beforeEach(function() {
					//ogLruCache.checkCapacity = sinon.stub();
					ogLruCache = ogLruCacheFactory(10, {});
				});
			
				it("should have the specified capacity", function() {
					ogLruCache.capacity.should.equal(10);
				});

				it("should have no head, tail or items", function() {
					ogLruCache.should.have.a.property("head");
					(ogLruCache.head === null).should.be.true;
					ogLruCache.should.have.a.property("tail");
					(ogLruCache.tail === null).should.be.true;
					Object.keys(ogLruCache.items).length.should.equal(0);
				});

				it("should check if it has exceeded it's capacity"); //TODO
			});

			describe("LruCache", function() {
				var capacity,
						data,
						list;

				beforeEach(function() {
					capacity = 10;
					data = {
						head: 10,
						tail: 1,
						items: {}
					};
					list = [];

					for (var i = 1; i <= capacity; i++) {
						data.items[i] = {
							id: i,
							name: "item " + i,
							older: i === 1 ? null : i - 1,
							newer: i === 10 ? null : i + 1
						};

						list.unshift({
							id: i,
							name: "item " + i
						});
					}

					ogLruCache = ogLruCacheFactory(capacity, data);
				});

				it("should have a head, tail and items", function() {
					ogLruCache.head.should.be.equal(data.head);
					ogLruCache.tail.should.be.equal(data.tail);
					Object.keys(ogLruCache.items).length.should.equal(10);
				});

				describe("put", function() {
					it("should leave the list unchanged if the item is already the current head", function() {
						ogLruCache.put({id: data.head, name: "item " + data.head}).should.deep.equal(list);
					});

					it("should move an existing item to the head of the list", function() {
						var newItem = {id: data.tail, name: "item " + data.tail},
								oldHead = ogLruCache.items[ogLruCache.head],
								oldTail = angular.copy(ogLruCache.items[ogLruCache.tail]),
								newHead,
								newTail,
								newList;

						// Move the tail item to the head
						newList = ogLruCache.put(newItem);
						newHead = ogLruCache.items[ogLruCache.head];
						newTail = ogLruCache.items[ogLruCache.tail];

						ogLruCache.head.should.equal(newItem.id);
						ogLruCache.tail.should.equal(oldTail.newer);
						(newHead.newer === null).should.be.true;
						newHead.older.should.equal(oldHead.id);
						oldHead.newer.should.equal(newHead.id);
						(newTail.older === null).should.be.true;

						list.pop();
						list.unshift(newItem);
						newList.should.deep.equal(list);
					});

					it("should add a new item to the list and check the list capacity", function() {
						ogLruCache.checkCapacity = sinon.stub();

						var newItem = {id: 11, name: "item 11"},
								oldHead = ogLruCache.items[ogLruCache.head],
								oldTail = angular.copy(ogLruCache.items[ogLruCache.tail]),
								newHead,
								newTail,
								newList;

						newList = ogLruCache.put(newItem);
						newHead = ogLruCache.items[ogLruCache.head];
						newTail = ogLruCache.items[ogLruCache.tail];

						ogLruCache.head.should.equal(newItem.id);
						ogLruCache.tail.should.equal(oldTail.newer);
						(newHead.newer === null).should.be.true;
						newHead.older.should.equal(oldHead.id);
						oldHead.newer.should.equal(newHead.id);
						(newTail.older === null).should.be.true;

						list.pop();
						list.unshift(newItem);
						newList.should.deep.equal(list);

						ogLruCache.checkCapacity.should.have.been.called;
					});
				});

				describe("checkCapacity", function() {
					it("should remove the last item from the list when the capacity has been exceeded", function() {
						ogLruCache.capacity = 8;
						ogLruCache.checkCapacity();
						Object.keys(ogLruCache.items).length.should.equal(9);
					});
				});

				describe("list", function() {
					it("should return the cached items in order", function() {
						ogLruCache.list().should.deep.equal(list);
					});

					it("should throw an error if it iterates more than the specified capacity", function() {
						ogLruCache.items[data.head].older = data.head;
						ogLruCache.list().should.throw("Possible infinite loop in LRU cache. Head: " + data.head + ", Tail: " + data.tail + ", Item: " + data.items[data.head] + ", Items: " + JSON.stringify(data.items));
					});
				});

				describe("dump", function() {
					it("should return a JSON object containing the cache head, tail and items", function() {
						ogLruCache.dump().should.deep.equal(data);
					});
				});
			});
		});
	});
})();
