describe("loot", () => {
	// Dependencies
	let	$urlServiceProvider,
			$rootScope,
			$state,
			ogNavigatorServiceWorkerService;

	// Load the modules
	beforeEach(module("ui.router", _$urlServiceProvider_ => {
		$urlServiceProvider = _$urlServiceProvider_;
		sinon.stub($urlServiceProvider.rules, "otherwise");
	}));

	beforeEach(module("lootMocks", "lootApp", mockDependenciesProvider => mockDependenciesProvider.load(["$state", "ogNavigatorServiceWorkerService"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$rootScope_, _$state_, _ogNavigatorServiceWorkerService_) => {
		$rootScope = _$rootScope_;
		$state = _$state_;
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
	}));

	describe("config", () => {
		it("should set a default URL route", () => $urlServiceProvider.rules.otherwise.should.have.been.calledWith("/accounts"));
	});

	describe("run", () => {
		it("should make the state configuration available on the $rootScope", () => $rootScope.$state.should.deep.equal($state));

		it("should register a service worker", () => ogNavigatorServiceWorkerService.register.should.have.been.calledWith("/service-worker.js"));
	});
});
