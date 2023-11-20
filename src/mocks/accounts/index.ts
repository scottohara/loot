// Components
import AccountMockProvider from "~/mocks/accounts/providers/account";
import AccountModelMockProvider from "~/mocks/accounts/models/account";
import AccountsMockProvider from "~/mocks/accounts/providers/accounts";
import AccountsWithBalancesMockProvider from "~/mocks/accounts/providers/accountsWithBalances";
import angular from "angular";

angular
	.module("lootAccountsMocks", [])
	.provider("accountMock", AccountMockProvider)
	.provider("accountsMock", AccountsMockProvider)
	.provider("accountsWithBalancesMock", AccountsWithBalancesMockProvider)
	.provider("accountModelMock", AccountModelMockProvider);
