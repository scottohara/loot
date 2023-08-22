import $ from "jquery";
import type { LootRootScope } from "~/loot/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type OgNavigatorServiceWorkerService from "~/og-components/og-navigator-serviceworker/services/og-navigator-serviceworker";
import type { UrlService } from "@uirouter/angularjs";
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
	}) as Mocha.HookFunction);

	beforeEach(angular.mock.module("lootMocks", "lootApp", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$state", "ogNavigatorServiceWorkerService"])) as Mocha.HookFunction);

	// Inject any dependencies that need to be configured first
	beforeEach(angular.mock.inject((_$window_: angular.IWindowService, _$rootScope_: LootRootScope, _$state_: angular.ui.IStateService, _ogNavigatorServiceWorkerService_: OgNavigatorServiceWorkerService): void => {
		$window = _$window_;
		$rootScope = _$rootScope_;
		$state = _$state_;
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
	}) as Mocha.HookFunction);

	describe("config", (): void => {
		it("should set a default URL route", (): Chai.Assertion => expect($urlServiceProvider.rules["otherwise"]).to.have.been.calledWith("/accounts"));
	});

	describe("run", (): void => {
		it("should make jQuery available on the $window", (): Chai.Assertion => expect($window.$).to.deep.equal($));

		it("should make the state configuration available on the $rootScope", (): Chai.Assertion => expect($rootScope.$state).to.deep.equal($state));

		it("should register a service worker", (): Chai.Assertion => expect(ogNavigatorServiceWorkerService["register"]).to.have.been.calledWith("/service-worker.js"));
	});
});
