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
					ogLruCache = ogLruCacheFactory(10, {});
				});
			
				it("should have the specified capacity", function() {
					ogLruCache.capacity.should.equal(10);
				});

				it("should have no head, tail or items", function() {
					(!(ogLruCache.head)).should.be.true;
					(!(ogLruCache.tail)).should.be.true;
					Object.keys(ogLruCache.items).length.should.equal(0);
				});
			});

			describe("LruCache", function() {
				var capacity,
						data,
						list;

				// Helper function that adds an item to the data object used to populate the LruCache
				var addItem = function(data, id) {
					data.items[id] = {
						id: id,
						name: "item " + id,
						older: id === 0 ? null : id - 1,
						newer: id === 10 ? null : id + 1
					};
				};

				beforeEach(function() {
					capacity = 10;
					data = {
						head: 10,
						tail: 0,
						items: {}
					};
					list = [];

					// Add one extra item to the data object (to test that capacity is checked on initialisation)
					addItem(data, 0);

					for (var i = 1; i <= capacity; i++) {
						addItem(data, i);

						list.unshift({
							id: i,
							name: "item " + i
						});
					}

					// Create the LruCache
					ogLruCache = ogLruCacheFactory(capacity, data);

					// Reset tail back to what it should be
					data.tail = 1;

					// Spy on the checkCapacity function
					sinon.spy(ogLruCache, "checkCapacity");
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

					var scenarios = [
						{
							description: "move an existing item from the tail of the list to the head of the list",
							item: {id: 1, name: "item 1"},
							checkCapacity: false
						},
						{
							description: "move an existing item to the head of the list",
							item: {id: 2, name: "item 2"},
							currentIndex: 8,
							checkCapacity: false
						},
						{
							description: "add a new item to the list and check the list capacity",
							item: {id: 11, name: "item 11"},
							checkCapacity: true
						}
					];

					scenarios.forEach(function(scenario) {
						it("should " + scenario.description, function() {
							var oldHead = ogLruCache.items[ogLruCache.head],
									expectedTail = scenario.currentIndex ? ogLruCache.items[ogLruCache.tail].id : ogLruCache.items[ogLruCache.tail].newer,
									newHead,
									newTail,
									newList;

							newList = ogLruCache.put(scenario.item);
							newHead = ogLruCache.items[ogLruCache.head];
							newTail = ogLruCache.items[ogLruCache.tail];

							ogLruCache.head.should.equal(scenario.item.id);
							ogLruCache.tail.should.equal(expectedTail);
							(!(newHead.newer)).should.be.true;
							newHead.older.should.equal(oldHead.id);
							oldHead.newer.should.equal(newHead.id);
							(!(newTail.older)).should.be.true;

							if (scenario.currentIndex) {
								list.splice(scenario.currentIndex, 1);
							} else {
								list.pop();
							}
							list.unshift(scenario.item);
							newList.should.deep.equal(list);

							if (scenario.checkCapacity) {
								ogLruCache.checkCapacity.should.have.been.called;
							} else {
								ogLruCache.checkCapacity.should.not.have.been.called;
							}
						});
					});

					it("should add a new item to an empty list and check the list capacity", function() {
						ogLruCache.head = undefined;
						ogLruCache.tail = undefined;
						ogLruCache.items = {};

						var item = {id: 11, name: "item 11"},
								newHead,
								newTail,
								newList;

						newList = ogLruCache.put(item);
						newHead = ogLruCache.items[ogLruCache.head];
						newTail = ogLruCache.items[ogLruCache.tail];

						ogLruCache.head.should.equal(item.id);
						ogLruCache.tail.should.equal(item.id);
						(!(newHead.newer)).should.be.true;
						(!(newHead.older)).should.be.true;
						(!(newTail.newer)).should.be.true;
						(!(newTail.older)).should.be.true;

						list = [item];
						newList.should.deep.equal(list);

						ogLruCache.checkCapacity.should.have.been.called;
					});
				});

				describe("checkCapacity", function() {
					it("should remove all items from the list that exceed the capacity", function() {
						ogLruCache.capacity = 3;
						ogLruCache.checkCapacity();
						Object.keys(ogLruCache.items).length.should.equal(3);
					});
				});

				describe("list", function() {
					it("should return the cached items in order", function() {
						ogLruCache.list().should.deep.equal(list);
					});

					it("should throw an error if it iterates more than the specified capacity", function() {
						ogLruCache.items[data.head].older = data.head;
						ogLruCache.list.bind(ogLruCache).should.throw("Possible infinite loop in LRU cache. Head: " + data.head + ", Tail: " + data.tail + ", Item: " + JSON.stringify(data.items[data.head]) + ", Items: " + JSON.stringify(data.items));
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
