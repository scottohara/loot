import type { Security } from "securities/types";
import type { SinonStub } from "sinon";

export interface SecurityModelMock {
	recent: string;
	type: string;
	all: SinonStub;
	allWithBalances: SinonStub;
	findLastTransaction: SinonStub;
	save: SinonStub;
	destroy: SinonStub;
	flush: SinonStub;
	addRecent: SinonStub;
	path: (id: number) => string;
	find: (id: number) => SinonStub;
	toggleFavourite: (security: Security) => SinonStub;
}