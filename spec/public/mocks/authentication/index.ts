// Components
import AuthenticatedMockProvider from "./providers/authenticated";
import AuthenticationModelMockProvider from "./models/authentication";
import angular from "angular";

angular.module("lootAuthenticationMocks", [])
	.provider("authenticationModelMock", AuthenticationModelMockProvider)
	.provider("authenticatedMock", AuthenticatedMockProvider);