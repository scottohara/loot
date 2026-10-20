import type {
	CacheFactoryMock,
	CacheMock,
} from "~/mocks/node-modules/angular/types";
import type { Mock } from "~/mocks/types";
import sinon from "sinon";

function mockCache(): CacheMock {
	return {
		put: sinon.stub(),
		get: sinon.stub(),
		info: sinon.stub(),
		remove: sinon.stub(),
		removeAll: sinon.stub(),
		destroy: sinon.stub(),
	};
}

export default class CacheFactoryMockProvider implements Mock<CacheFactoryMock> {
	private readonly $cacheFactory: CacheFactoryMock;

	public constructor(
		private readonly $cache: CacheMock = mockCache(),
		private readonly templatesCache: CacheMock = mockCache(),
	) {
		const factory: CacheFactoryMock = (): CacheMock => this.$cache;

		factory.info = sinon.stub().returns([{ id: "templates" }, { id: "test" }]);

		// Returns a cache by it's name
		factory.get = sinon.stub();
		factory.get.withArgs("templates").returns(this.templatesCache);
		factory.get.withArgs("test").returns(this.$cache);

		// Mock $cacheFactory object, returns the mock $cache object
		this.$cacheFactory = factory;
	}

	public $get(): CacheFactoryMock {
		return this.$cacheFactory;
	}
}

CacheFactoryMockProvider.$inject = [];
