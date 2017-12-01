// Components
import SecuritiesMockProvider from "./providers/securities";
import SecurityMockProvider from "./providers/security";
import SecurityModelMockProvider from "./models/security";
import angular from "angular";

angular.module("lootSecuritiesMocks", [])
	.provider("securitiesMock", SecuritiesMockProvider)
	.provider("securityMock", SecurityMockProvider)
	.provider("securityModelMock", SecurityModelMockProvider);