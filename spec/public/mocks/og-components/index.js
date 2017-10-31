// Components
import AlertMockProvider from "./og-modal-alert/models/alert";
import ConfirmMockProvider from "./og-modal-confirm/models/confirm";
import OgInputCurrencyControllerMockProvider from "./og-input-currency/controllers/currency";
import OgInputNumberControllerMockProvider from "./og-input-number/controllers/number";
import OgLruCacheFactoryMockProvider from "./og-lru-cache-factory/models/og-lru-cache-factory";
import OgNavigatorServiceWorkerServiceMockProvider from "./og-navigator-serviceworker/services/og-navigator-serviceworker";
import angular from "angular";

angular.module("ogComponentsMocks", [])
	.provider("ogInputCurrencyControllerMock", OgInputCurrencyControllerMockProvider)
	.provider("ogInputNumberControllerMock", OgInputNumberControllerMockProvider)
	.provider("ogLruCacheFactoryMock", OgLruCacheFactoryMockProvider)
	.provider("alertMock", AlertMockProvider)
	.provider("confirmMock", ConfirmMockProvider)
	.provider("ogNavigatorServiceWorkerServiceMock", OgNavigatorServiceWorkerServiceMockProvider);