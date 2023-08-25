// Dependent modules
import "~/mocks/accounts";
import "~/mocks/authentication";
import "~/mocks/categories";
import "~/mocks/node-modules";
import "~/mocks/og-components";
import "~/mocks/payees";
import "~/mocks/schedules";
import "~/mocks/securities";
import "~/mocks/transactions";

// Components
import ControllerTest from "~/mocks/loot/controllertest";
import DirectiveTest from "~/mocks/loot/directivetest";
import MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import angular from "angular";

angular.module("lootMocks", [
	"ogNodeModulesMocks",
	"ogComponentsMocks",
	"lootAccountsMocks",
	"lootAuthenticationMocks",
	"lootCategoriesMocks",
	"lootPayeesMocks",
	"lootSchedulesMocks",
	"lootSecuritiesMocks",
	"lootTransactionsMocks"
])
	.service("controllerTest", ControllerTest)
	.service("directiveTest", DirectiveTest)
	.provider("mockDependencies", MockDependenciesProvider);