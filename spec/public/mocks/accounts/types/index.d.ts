import type {
	Account,
	Accounts
} from "accounts/types";
import type { SinonStub } from "sinon";

export interface AccountModelMock {
	recent: string;
	type: string;
	all: SinonStub;
	allWithBalances: SinonStub;
	save: SinonStub;
	destroy: SinonStub;
	reconcile: SinonStub;
	isUnreconciledOnly: SinonStub;
	unreconciledOnly: SinonStub;
	flush: SinonStub;
	addRecent: SinonStub;
	accounts: Accounts;
	path: (id: number) => string;
	find: (id: number) => SinonStub;
	toggleFavourite: (account: Account) => SinonStub;
}