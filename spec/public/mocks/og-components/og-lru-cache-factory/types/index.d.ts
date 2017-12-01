import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";
import {SinonStub} from "sinon";

export interface OgLruCacheMock {
	list: OgCacheEntry[];
	put: SinonStub;
	remove: SinonStub;
}

export interface OgLruCacheFactoryMock {
	new: () => OgLruCacheMock;
}