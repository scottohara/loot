import type { OgCacheEntry } from "~/og-components/og-lru-cache-factory/types";
import type OgLruCache from "~/og-components/og-lru-cache-factory/models/og-lru-cache";
import type OgLruCacheFactory from "~/og-components/og-lru-cache-factory/models/og-lru-cache-factory";
import angular from "angular";

describe("ogLruCacheFactory", (): void => {
	let ogLruCacheFactory: OgLruCacheFactory;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction);

	// Inject the object under test
	beforeEach(angular.mock.inject((_ogLruCacheFactory_: OgLruCacheFactory): OgLruCacheFactory => (ogLruCacheFactory = _ogLruCacheFactory_)) as Mocha.HookFunction);

	describe("new", (): void => {
		let ogLruCache: OgLruCache;

		it("should return an LruCache", (): Chai.Assertion => expect(ogLruCacheFactory.new(10, [])).to.be.an("object"));

		describe("LruCache (empty)", (): void => {
			beforeEach((): OgLruCache => (ogLruCache = ogLruCacheFactory.new(10, [])));

			it("should have the specified capacity", (): Chai.Assertion => expect(ogLruCache["capacity"]).to.equal(10));

			it("should have no items", (): Chai.Assertion => expect(ogLruCache.list).to.be.an("array").that.is.empty);
		});

		describe("LruCache", (): void => {
			const capacity = 10;
			let	data: OgCacheEntry[],
					list: OgCacheEntry[];

			beforeEach((): void => {
				// Populate the data with capacity + 1 items (to check that the oldest item is evicted)
				data = [...Array(capacity + 1).keys()].reverse().map((id: number): OgCacheEntry => ({ id, name: `item ${id}` }));
				list = data.slice(0, capacity);

				// Create the LruCache
				ogLruCache = ogLruCacheFactory.new(capacity, data);
			});

			it("should be populated with the initial set of items", (): Chai.Assertion => expect(ogLruCache["items"]).to.deep.equal(list));

			describe("put", (): void => {
				it("should leave the list unchanged if the item is already the current head", (): Chai.Assertion => expect(ogLruCache.put({ id: capacity, name: `item ${capacity}` })).to.deep.equal(list));

				const scenarios: { description: string; item: OgCacheEntry; currentIndex?: number; }[] = [
					{
						description: "move an existing item from the tail of the list to the head of the list",
						item: { id: 1, name: "item 1" }
					},
					{
						description: "move an existing item to the head of the list",
						item: { id: 2, name: "item 2" },
						currentIndex: 8
					},
					{
						description: "add a new item to the list",
						item: { id: 11, name: "item 11" }
					}
				];

				scenarios.forEach((scenario: { description: string; item: OgCacheEntry; currentIndex?: number; }): void => {
					it(`should ${scenario.description}`, (): void => {
						const newList: OgCacheEntry[] = ogLruCache.put(scenario.item);

						if (undefined === scenario.currentIndex) {
							list.pop();
						} else {
							list.splice(scenario.currentIndex, 1);
						}
						list.unshift(scenario.item);
						expect(newList).to.deep.equal(list);
					});
				});

				it("should add a new item to an empty list", (): void => {
					ogLruCache["items"] = [];

					const item: OgCacheEntry = { id: 11, name: "item 11" },
								newList: OgCacheEntry[] = ogLruCache.put(item);

					list = [item];
					expect(newList).to.deep.equal(list);
				});
			});

			describe("remove", (): void => {
				it("should leave the list unchanged if the item does not exist", (): Chai.Assertion => expect(ogLruCache.remove(-1)).to.deep.equal(list));

				describe("existing item", (): void => {
					let id: number;

					it("should remove the only item from the list", (): void => {
						id = 1;
						ogLruCache["items"] = [
							{ id, name: `item ${id}` }
						];

						ogLruCache.remove(id);
						expect(ogLruCache["items"]).to.be.an("array").that.is.empty;
					});

					it("should remove an item from the head of the list", (): void => {
						id = 10;
						ogLruCache.remove(id);
						expect(ogLruCache["items"]).to.deep.equal(list.slice(1, capacity));
					});

					it("should remove an item from the tail of the list", (): void => {
						id = 1;
						ogLruCache.remove(id);
						expect(ogLruCache["items"]).to.deep.equal(list.slice(0, capacity - 1));
					});

					it("should remove an item from the middle of the list", (): void => {
						id = 5;
						ogLruCache.remove(id);
						expect(ogLruCache["items"]).to.deep.equal([...list.slice(0, 5), ...list.slice(6, capacity)]);
					});
				});
			});

			describe("list", (): void => {
				it("should return the cached items in order", (): Chai.Assertion => expect(ogLruCache.list).to.deep.equal(list));
			});
		});
	});
});
