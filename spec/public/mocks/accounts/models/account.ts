import {
	PromiseMockConfig,
	QMock
} from "mocks/node-modules/angular/types";
import sinon, { SinonStub } from "sinon";
import { Account } from "accounts/types";
import AccountMockProvider from "mocks/accounts/providers/account";
import { AccountModelMock } from "mocks/accounts/types";
import AccountsMockProvider from "mocks/accounts/providers/accounts";
import AccountsWithBalancesMockProvider from "mocks/accounts/providers/accountsWithBalances";
import { Mock } from "mocks/types";
import QMockProvider from "mocks/node-modules/angular/services/q";

export default class AccountModelMockProvider implements Mock<AccountModelMock> {
	private readonly accountModel: AccountModelMock;

	public constructor(accountMockProvider: AccountMockProvider, accountsMockProvider: AccountsMockProvider, accountsWithBalancesMockProvider: AccountsWithBalancesMockProvider, $qMockProvider: QMockProvider) {
		/*
		 * Success/error = options for the stub promises
		 * all/allWithBalances =  promise-like responses
		 */
		const	$q: QMock = $qMockProvider.$get(),
					all: SinonStub = $q.promisify({
						response: accountsMockProvider.$get()
					}),
					allWithBalances: SinonStub = $q.promisify({
						response: accountsWithBalancesMockProvider.$get()
					}),
					success: PromiseMockConfig<{data: Account;}> = {
						args: { id: 1 },
						response: { data: accountMockProvider.$get() }
					},
					error: PromiseMockConfig<void> = {
						args: { id: -1 }
					};

		// Configure the different responses for all()
		all.withArgs(true).returns(allWithBalances());

		// Mock accountModel object
		this.accountModel = {
			recent: "recent accounts list",
			type: "account",
			path(id: number): string {
				return `/accounts/${id}`;
			},
			all: sinon.stub().returns(all()),
			allWithBalances: sinon.stub().returns(all(true)),
			find(id: number): SinonStub {
				// Get the matching account
				const account: Account = accountsMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the account
				return $q.promisify({ response: account })();
			},
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			reconcile: $q.promisify(),
			toggleFavourite(account: Account): SinonStub {
				return $q.promisify({ response: !account.favourite })();
			},
			isUnreconciledOnly: sinon.stub().returns(true),
			unreconciledOnly: sinon.stub(),
			flush: sinon.stub(),
			addRecent: sinon.stub(),
			accounts: accountsWithBalancesMockProvider.$get()
		};

		// Spy on find() and toggleFavourite()
		sinon.spy(this.accountModel, "find");
		sinon.spy(this.accountModel, "toggleFavourite");
	}

	// Return the mock accountModel object
	public $get(): AccountModelMock {
		return this.accountModel;
	}
}

AccountModelMockProvider.$inject = ["accountMockProvider", "accountsMockProvider", "accountsWithBalancesMockProvider", "$qMockProvider"];