import angular from "angular";

describe("ogNavigatorServiceWorkerService", () => {
	let	ogNavigatorServiceWorkerService,
			$window;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", mockDependenciesProvider => mockDependenciesProvider.load(["$window"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_ogNavigatorServiceWorkerService_, _$window_) => {
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
		$window = _$window_;
	}));

	describe("register", () => {
		it("should do nothing when serviceWorker is not supported", () => {
			const {serviceWorker} = $window.navigator;

			delete $window.navigator.serviceWorker;

			ogNavigatorServiceWorkerService.register();
			serviceWorker.register.should.not.have.been.called;
		});

		it("should log a message when the service worker is successfully registered", () => {
			ogNavigatorServiceWorkerService.register("good-script");
			$window.console.log.should.have.been.calledWith("ServiceWorker registration successful with scope: test scope");
		});

		it("should log an error when the service worker is not successfully registered", () => {
			ogNavigatorServiceWorkerService.register("bad-script");
			$window.console.log.should.have.been.calledWith("ServiceWorker registration failed: test error");
		});
	});
});
