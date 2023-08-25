// Components
import AlertMockProvider from "~/mocks/og-components/og-modal-alert/models/alert";
import ConfirmMockProvider from "~/mocks/og-components/og-modal-confirm/models/confirm";
import OgInputCurrencyControllerMockProvider from "~/mocks/og-components/og-input-currency/controllers/currency";
import OgInputNumberControllerMockProvider from "~/mocks/og-components/og-input-number/controllers/number";
import OgLruCacheFactoryMockProvider from "~/mocks/og-components/og-lru-cache-factory/models/og-lru-cache-factory";
import OgModalErrorServiceMockProvider from "~/mocks/og-components/og-modal-error/services/og-modal-error";
import OgNavigatorServiceWorkerServiceMockProvider from "~/mocks/og-components/og-navigator-serviceworker/services/og-navigator-serviceworker";
import angular from "angular";

angular.module("ogComponentsMocks", [])
	.provider("ogInputCurrencyControllerMock", OgInputCurrencyControllerMockProvider)
	.provider("ogInputNumberControllerMock", OgInputNumberControllerMockProvider)
	.provider("ogLruCacheFactoryMock", OgLruCacheFactoryMockProvider)
	.provider("alertMock", AlertMockProvider)
	.provider("confirmMock", ConfirmMockProvider)
	.provider("ogModalErrorServiceMock", OgModalErrorServiceMockProvider)
	.provider("ogNavigatorServiceWorkerServiceMock", OgNavigatorServiceWorkerServiceMockProvider);