import MockDependenciesProvider from "mocks/loot/mockdependencies";
import OgNavigatorServiceWorkerService from "og-components/og-navigator-serviceworker/services/og-navigator-serviceworker";
import {SinonStub} from "sinon";
import {WindowMock} from "mocks/node-modules/angular/types";
import angular from "angular";

describe("ogNavigatorServiceWorkerService", (): void => {
	let	ogNavigatorServiceWorkerService: OgNavigatorServiceWorkerService,
			$window: WindowMock;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$window"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_ogNavigatorServiceWorkerService_: OgNavigatorServiceWorkerService, _$window_: WindowMock): void => {
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
		$window = _$window_;
	}));

	describe("register", (): void => {
		it("should do nothing when serviceWorker is not supported", (): void => {
			const {serviceWorker}: {serviceWorker: {register: SinonStub;};} = $window.navigator;

			delete $window.navigator.serviceWorker;

			ogNavigatorServiceWorkerService.register("");
			serviceWorker.register.should.not.have.been.called;
		});

		it("should log a message when the service worker is successfully registered", (): void => {
			ogNavigatorServiceWorkerService.register("good-script");
			$window.console.log.should.have.been.calledWith("ServiceWorker registration successful with scope: test scope");
		});

		it("should log an error when the service worker is not successfully registered", (): void => {
			ogNavigatorServiceWorkerService.register("bad-script");
			$window.console.log.should.have.been.calledWith("ServiceWorker registration failed: test error");
		});
	});
});
