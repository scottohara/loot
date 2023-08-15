// Components
import PayeeMockProvider from "~/mocks/payees/providers/payee";
import PayeeModelMockProvider from "~/mocks/payees/models/payee";
import PayeesMockProvider from "~/mocks/payees/providers/payees";
import angular from "angular";

angular.module("lootPayeesMocks", [])
	.provider("payeeMock", PayeeMockProvider)
	.provider("payeesMock", PayeesMockProvider)
	.provider("payeeModelMock", PayeeModelMockProvider);