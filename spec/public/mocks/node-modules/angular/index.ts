// Components
import AnchorScrollMockProvider from "./services/anchorscroll";
import CacheFactoryMockProvider from "./services/cachefactory";
import IHttpPromiseMockProvider from "./providers/ihttppromise";
import IPromiseMockProvider from "./providers/ipromise";
import QMockProvider from "./services/q";
import StateMockProvider from "./services/state";
import UibModalInstanceMockProvider from "./services/uibmodalinstance";
import UibModalMockProvider from "./services/uibmodal";
import WindowMockProvider from "./services/window";
import angular from "angular";

angular.module("ogAngularMocks", [])
	.provider("$anchorScrollMock", AnchorScrollMockProvider)
	.provider("$cacheFactoryMock", CacheFactoryMockProvider)
	.provider("$qMock", QMockProvider)
	.provider("$stateMock", StateMockProvider)
	.provider("$uibModalMock", UibModalMockProvider)
	.provider("$uibModalInstanceMock", UibModalInstanceMockProvider)
	.provider("$windowMock", WindowMockProvider)
	.provider("iHttpPromiseMock", IHttpPromiseMockProvider)
	.provider("iPromiseMock", IPromiseMockProvider);