// Dependent modules
import "./accounts";
import "./authentication";
import "./categories";
import "./node_modules";
import "./og-components";
import "./payees";
import "./schedules";
import "./securities";
import "./transactions";

// Components
import ControllerTest from "./loot/controllertest";
import DirectiveTest from "./loot/directivetest";
import MockDependenciesProvider from "./loot/mockdependencies";
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