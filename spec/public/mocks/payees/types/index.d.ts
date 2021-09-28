import type { Payee } from "payees/types";
import type { SinonStub } from "sinon";

export interface PayeeModelMock {
	recent: string;
	type: string;
	all: SinonStub;
	allList: SinonStub;
	findLastTransaction: SinonStub;
	save: SinonStub;
	destroy: SinonStub;
	flush: SinonStub;
	addRecent: SinonStub;
	path: (id: number) => string;
	find: (id: number) => SinonStub;
	toggleFavourite: (payee: Payee) => SinonStub;
}