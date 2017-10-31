import $ from "jquery";
import angular from "angular";

describe("loot", () => {
	// Dependencies
	let	$urlServiceProvider,
			$window,
			$rootScope,
			$state,
			ogNavigatorServiceWorkerService;

	// Load the modules
	beforeEach(angular.mock.module("ui.router", _$urlServiceProvider_ => {
		$urlServiceProvider = _$urlServiceProvider_;
		sinon.stub($urlServiceProvider.rules, "otherwise");
	}));

	beforeEach(angular.mock.module("lootMocks", "lootApp", mockDependenciesProvider => mockDependenciesProvider.load(["$state", "ogNavigatorServiceWorkerService"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$window_, _$rootScope_, _$state_, _ogNavigatorServiceWorkerService_) => {
		$window = _$window_;
		$rootScope = _$rootScope_;
		$state = _$state_;
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
	}));

	describe("config", () => {
		it("should set a default URL route", () => $urlServiceProvider.rules.otherwise.should.have.been.calledWith("/accounts"));
	});

	describe("run", () => {
		it("should make jQuery available on the $window", () => $window.$.should.deep.equal($));

		it("should make the state configuration available on the $rootScope", () => $rootScope.$state.should.deep.equal($state));

		it("should register a service worker", () => ogNavigatorServiceWorkerService.register.should.have.been.calledWith("/service-worker.js"));
	});
});
