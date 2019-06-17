import { SinonStub } from "sinon";

export interface TransactionModelMock {
	all: SinonStub;
	query: SinonStub;
	findSubtransactions: SinonStub;
	find: SinonStub;
	save: SinonStub;
	destroy: SinonStub;
	updateStatus: SinonStub;
	flag: SinonStub;
	unflag: SinonStub;
	allDetailsShown: SinonStub;
	showAllDetails: SinonStub;
	lastTransactionDate: Date;
}