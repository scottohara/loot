import type { OgCacheEntry } from "~/og-components/og-lru-cache-factory/types";
import type { SinonStub } from "sinon";

export interface OgLruCacheMock {
	list: OgCacheEntry[];
	put: SinonStub;
	remove: SinonStub;
}

export interface OgLruCacheFactoryMock {
	new: () => OgLruCacheMock;
}