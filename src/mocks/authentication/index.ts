// Components
import AuthenticatedMockProvider from "~/mocks/authentication/providers/authenticated";
import AuthenticationModelMockProvider from "~/mocks/authentication/models/authentication";
import angular from "angular";

angular
	.module("lootAuthenticationMocks", [])
	.provider("authenticationModelMock", AuthenticationModelMockProvider)
	.provider("authenticatedMock", AuthenticatedMockProvider);
