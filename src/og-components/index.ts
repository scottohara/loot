// Dependent modules
import "angular-ui-bootstrap";

// Components
import OgFavouriteDirective from "./og-favourite/directives/og-favourite";
import OgInputAutoSelectDirective from "./og-input-autoselect/directives/og-input-autoselect";
import OgInputCalculatorDirective from "./og-input-calculator/directives/og-input-calculator";
import OgInputCurrencyController from "./og-input-currency/controllers/currency";
import OgInputCurrencyDirective from "./og-input-currency/directives/og-input-currency";
import OgInputNumberController from "./og-input-number/controllers/number";
import OgInputNumberDirective from "./og-input-number/directives/og-input-number";
import OgLoadingSpinnerDirective from "./og-loading-spinner/directives/og-loading-spinner";
import OgLruCacheFactory from "./og-lru-cache-factory/models/og-lru-cache-factory";
import OgModalAlertController from "./og-modal-alert/controllers/alert";
import OgModalConfirmController from "./og-modal-confirm/controllers/confirm";
import OgNavigatorServiceWorkerService from "./og-navigator-serviceworker/services/og-navigator-serviceworker";
import OgTableLoadingDirective from "./og-table-loading/directives/og-table-loading";
import OgTableNavigableDirective from "./og-table-navigable/directives/og-table-navigable";
import OgTableNavigableService from "./og-table-navigable/services/og-table-navigable";
import OgViewScrollService from "./og-view-scroll/services/og-view-scroll";
import angular from "angular";

angular.module("ogComponents", [
	"ui.bootstrap"
])
	.directive("ogFavourite", OgFavouriteDirective.factory)
	.directive("ogInputAutoselect", OgInputAutoSelectDirective.factory)
	.directive("ogInputCalculator", OgInputCalculatorDirective.factory)
	.controller("OgInputCurrencyController", OgInputCurrencyController)
	.directive("ogInputCurrency", OgInputCurrencyDirective.factory)
	.controller("OgInputNumberController", OgInputNumberController)
	.directive("ogInputNumber", OgInputNumberDirective.factory)
	.directive("ogLoadingSpinner", OgLoadingSpinnerDirective.factory)
	.service("ogLruCacheFactory", OgLruCacheFactory)
	.controller("OgModalAlertController", OgModalAlertController)
	.controller("OgModalConfirmController", OgModalConfirmController)
	.service("ogNavigatorServiceWorkerService", OgNavigatorServiceWorkerService)
	.directive("ogTableLoading", OgTableLoadingDirective.factory)
	.directive("ogTableNavigable", OgTableNavigableDirective.factory)
	.service("ogTableNavigableService", OgTableNavigableService)
	.service("ogViewScrollService", OgViewScrollService);