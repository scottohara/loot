describe("loot", () => {
	// Dependencies
	let	$urlRouterProvider,
			$rootScope,
			$state,
			ogNavigatorServiceWorkerService;

	// Load the modules
	beforeEach(module("ui.router", _$urlRouterProvider_ => {
		$urlRouterProvider = _$urlRouterProvider_;
		sinon.stub($urlRouterProvider, "otherwise");
	}));

	beforeEach(module("lootMocks", "lootApp", mockDependenciesProvider => mockDependenciesProvider.load(["$state", "ogNavigatorServiceWorkerService"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$rootScope_, _$state_, _ogNavigatorServiceWorkerService_) => {
		$rootScope = _$rootScope_;
		$state = _$state_;
		ogNavigatorServiceWorkerService = _ogNavigatorServiceWorkerService_;
	}));

	describe("config", () => {
		it("should set a default URL route", () => $urlRouterProvider.otherwise.should.have.been.calledWith("/accounts"));
	});

	describe("run", () => {
		it("should make the state configuration available on the $rootScope", () => $rootScope.$state.should.deep.equal($state));

		describe("stateChangeErrorHandler", () => {
			it("should log the error to the browser console", () => {
				const toState = "to state",
							toParams = "to params",
							fromState = "from state",
							fromParams = "from params",
							error = "error";

				sinon.stub(console, "error");

				$rootScope.stateChangeErrorHandler(null, toState, toParams, fromState, fromParams, error);
				console.error.should.have.been.calledWith(toState, toParams, fromState, fromParams);
			});
		});

		it("should attach a state change error handler", () => {
			sinon.stub($rootScope, "stateChangeErrorHandler");
			$rootScope.$emit("$stateChangeError");
			$rootScope.stateChangeErrorHandler.should.have.been.called;
		});

		it("should register a service worker", () => ogNavigatorServiceWorkerService.register.should.have.been.calledWith("/service-worker.js"));
	});
});
