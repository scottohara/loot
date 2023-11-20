// Dependent modules
import "angular-ui-bootstrap";

// Components
import OgFavouriteDirective from "~/og-components/og-favourite/directives/og-favourite";
import OgInputAutoSelectDirective from "~/og-components/og-input-autoselect/directives/og-input-autoselect";
import OgInputCalculatorDirective from "~/og-components/og-input-calculator/directives/og-input-calculator";
import OgInputCurrencyController from "~/og-components/og-input-currency/controllers/currency";
import OgInputCurrencyDirective from "~/og-components/og-input-currency/directives/og-input-currency";
import OgInputNumberController from "~/og-components/og-input-number/controllers/number";
import OgInputNumberDirective from "~/og-components/og-input-number/directives/og-input-number";
import OgLoadingSpinnerDirective from "~/og-components/og-loading-spinner/directives/og-loading-spinner";
import OgLruCacheFactory from "~/og-components/og-lru-cache-factory/models/og-lru-cache-factory";
import OgModalAlertController from "~/og-components/og-modal-alert/controllers/alert";
import OgModalConfirmController from "~/og-components/og-modal-confirm/controllers/confirm";
import OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import OgNavigatorServiceWorkerService from "~/og-components/og-navigator-serviceworker/services/og-navigator-serviceworker";
import OgTableLoadingDirective from "~/og-components/og-table-loading/directives/og-table-loading";
import OgTableNavigableDirective from "~/og-components/og-table-navigable/directives/og-table-navigable";
import OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import OgViewScrollService from "~/og-components/og-view-scroll/services/og-view-scroll";
import angular from "angular";

angular
	.module("ogComponents", ["ui.bootstrap"])
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
	.service("ogModalErrorService", OgModalErrorService)
	.service("ogNavigatorServiceWorkerService", OgNavigatorServiceWorkerService)
	.directive("ogTableLoading", OgTableLoadingDirective.factory)
	.directive("ogTableNavigable", OgTableNavigableDirective.factory)
	.service("ogTableNavigableService", OgTableNavigableService)
	.service("ogViewScrollService", OgViewScrollService);
