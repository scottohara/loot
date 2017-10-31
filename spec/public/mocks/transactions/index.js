// Components
import ContextMockProvider from "./providers/context";
import ContextModelMockProvider from "./models/context";
import TransactionBatchMockProvider from "./providers/transactionbatch";
import TransactionMockProvider from "./providers/transaction";
import TransactionModelMockProvider from "./models/transaction";
import angular from "angular";

angular.module("lootTransactionsMocks", [])
	.provider("contextMock", ContextMockProvider)
	.provider("transactionMock", TransactionMockProvider)
	.provider("transactionBatchMock", TransactionBatchMockProvider)
	.provider("contextModelMock", ContextModelMockProvider)
	.provider("transactionModelMock", TransactionModelMockProvider);