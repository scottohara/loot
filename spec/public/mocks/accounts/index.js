// Components
import AccountMockProvider from "./providers/account";
import AccountModelMockProvider from "./models/account";
import AccountsMockProvider from "./providers/accounts";
import AccountsWithBalancesMockProvider from "./providers/accountsWithBalances";
import angular from "angular";

angular.module("lootAccountsMocks", [])
	.provider("accountMock", AccountMockProvider)
	.provider("accountsMock", AccountsMockProvider)
	.provider("accountsWithBalancesMock", AccountsWithBalancesMockProvider)
	.provider("accountModelMock", AccountModelMockProvider);