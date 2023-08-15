// Components
import SecuritiesMockProvider from "~/mocks/securities/providers/securities";
import SecurityMockProvider from "~/mocks/securities/providers/security";
import SecurityModelMockProvider from "~/mocks/securities/models/security";
import angular from "angular";

angular.module("lootSecuritiesMocks", [])
	.provider("securitiesMock", SecuritiesMockProvider)
	.provider("securityMock", SecurityMockProvider)
	.provider("securityModelMock", SecurityModelMockProvider);