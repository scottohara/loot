// These dependencies need to be loaded first
import "./bootstrap";

// Dependent modules
import "angular-ui-bootstrap";
import "og-components";
import "accounts";
import "authentication";
import "categories";
import "payees";
import "schedules";
import "securities";
import "transactions";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/loot.less";

// Components
import $ from "jquery";
import LayoutController from "./controllers/layout";
import type { LootRootScope } from "loot/types";
import LootStatesProvider from "./providers/states";
import type OgNavigatorServiceWorkerService from "og-components/og-navigator-serviceworker/services/og-navigator-serviceworker";
import type { UrlService } from "@uirouter/angularjs";
import angular from "angular";

angular.module("lootApp", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents",
	"lootAccounts",
	"lootAuthentication",
	"lootCategories",
	"lootPayees",
	"lootSchedules",
	"lootSecurities",
	"lootStates",
	"lootTransactions"
])
	.controller("LayoutController", LayoutController)

	// Default to account list for any unmatched URLs
	.config(["$urlServiceProvider", "lootStatesProvider", ($urlServiceProvider: UrlService): void => $urlServiceProvider.rules.otherwise("/accounts")])

	// Runtime initialisation
	.run(["$rootScope", "$window", "$state", "ogNavigatorServiceWorkerService", ($rootScope: LootRootScope, $window: angular.IWindowService, $state: angular.ui.IStateService, ogNavigatorServiceWorkerService: OgNavigatorServiceWorkerService): void => {
		// Ensure that jQuery is available on the $window service
		$window.$ = $;

		// Ensure that the $state service is accessible from the $rootScope
		$rootScope.$state = $state;

		// ServiceWorker registration
		ogNavigatorServiceWorkerService.register("/service-worker.js");
	}]);

angular.module("lootStates", [
	"ui.bootstrap",
	"ui.router",
	"lootAccounts",
	"lootAuthentication",
	"lootCategories",
	"lootPayees",
	"lootSchedules",
	"lootSecurities",
	"lootTransactions"
])
	.provider("lootStates", LootStatesProvider);