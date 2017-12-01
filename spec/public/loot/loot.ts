import $ from "jquery";
import {LootRootScope} from "loot/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import OgNavigatorServiceWorkerService from "og-components/og-navigator-serviceworker/services/og-navigator-serviceworker";
import {UrlService} from "@uirouter/angularjs";
import angular from "angular";
import sinon from "sinon";

describe("loot", (): void => {
	// Dependencies
	let	$urlServiceProvider: UrlService,
			$window: angular.IWindowService,
			$rootScope: LootRootScope,
			$state: angular.ui.IStateService,
			ogNavigatorServiceWorkerService: OgNavigatorServiceWorkerService;

	// Load the modules
	beforeEach(angular.mock.module("ui.router", (_$urlServiceProvider_: UrlService): void => {
		$urlServiceProvider = _$urlServiceProvider_;
		sinon.stub($urlServiceProvider.rules, "otherwise");
	}));

	beforeEach(angular.mock.module("lootMocks", "lootApp", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$state", "ogNavigatorServiceWorkerService"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$window_: angular.IWindowService, _$rootScope_: LootRootScope, _$state_: angular.ui.IStateService, _ogNavigatorServiceWorkerService_: OgNavigatorServiceWorkerService): void => {
		$window = _$window_;
		$rootScope = _$rootScope_;
		$state = _$state_;
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
	}));

	describe("config", (): void => {
		it("should set a default URL route", (): Chai.Assertion => $urlServiceProvider.rules.otherwise.should.have.been.calledWith("/accounts"));
	});

	describe("run", (): void => {
		it("should make jQuery available on the $window", (): Chai.Assertion => $window.$.should.deep.equal($));

		it("should make the state configuration available on the $rootScope", (): Chai.Assertion => $rootScope.$state.should.deep.equal($state));

		it("should register a service worker", (): Chai.Assertion => ogNavigatorServiceWorkerService.register.should.have.been.calledWith("/service-worker.js"));
	});
});
