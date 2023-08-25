// Components
import ContextMockProvider from "~/mocks/transactions/providers/context";
import ContextModelMockProvider from "~/mocks/transactions/models/context";
import TransactionBatchMockProvider from "~/mocks/transactions/providers/transactionbatch";
import TransactionMockProvider from "~/mocks/transactions/providers/transaction";
import TransactionModelMockProvider from "~/mocks/transactions/models/transaction";
import angular from "angular";

angular.module("lootTransactionsMocks", [])
	.provider("contextMock", ContextMockProvider)
	.provider("transactionMock", TransactionMockProvider)
	.provider("transactionBatchMock", TransactionBatchMockProvider)
	.provider("contextModelMock", ContextModelMockProvider)
	.provider("transactionModelMock", TransactionModelMockProvider);