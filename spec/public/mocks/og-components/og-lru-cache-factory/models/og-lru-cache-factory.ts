import {
	OgLruCacheFactoryMock,
	OgLruCacheMock
} from "mocks/og-components/og-lru-cache-factory/types";
import { Mock } from "mocks/types";
import sinon from "sinon";

export default class OgLruCacheFactoryMockProvider implements Mock<OgLruCacheFactoryMock> {
	private readonly ogLruCacheFactory: OgLruCacheFactoryMock;

	// Mock LruCache object
	public constructor() {
		const ogLruCache: OgLruCacheMock = {
			list: [{ id: 1, name: "recent item" }],
			put: sinon.stub().returns("updated list"),
			remove: sinon.stub().returns("updated list")
		};

		this.ogLruCacheFactory = {
			new(): OgLruCacheMock {
				return ogLruCache;
			}
		};
	}

	public $get(): OgLruCacheFactoryMock {
		// Return the mock LruCacheFactory object
		return this.ogLruCacheFactory;
	}
}

OgLruCacheFactoryMockProvider.$inject = [];