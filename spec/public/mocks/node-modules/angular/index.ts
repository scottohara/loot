// Components
import AnchorScrollMockProvider from "~/mocks/node-modules/angular/services/anchorscroll";
import CacheFactoryMockProvider from "~/mocks/node-modules/angular/services/cachefactory";
import IHttpPromiseMockProvider from "~/mocks/node-modules/angular/providers/ihttppromise";
import IPromiseMockProvider from "~/mocks/node-modules/angular/providers/ipromise";
import QMockProvider from "~/mocks/node-modules/angular/services/q";
import StateMockProvider from "~/mocks/node-modules/angular/services/state";
import UibModalInstanceMockProvider from "~/mocks/node-modules/angular/services/uibmodalinstance";
import UibModalMockProvider from "~/mocks/node-modules/angular/services/uibmodal";
import WindowMockProvider from "~/mocks/node-modules/angular/services/window";
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