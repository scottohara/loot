// Components
import PayeeMockProvider from "./providers/payee";
import PayeeModelMockProvider from "./models/payee";
import PayeesMockProvider from "./providers/payees";
import angular from "angular";

angular.module("lootPayeesMocks", [])
	.provider("payeeMock", PayeeMockProvider)
	.provider("payeesMock", PayeesMockProvider)
	.provider("payeeModelMock", PayeeModelMockProvider);