describe("loot", () => {
	// Dependencies
	let	$urlRouterProvider,
			$http,
			$rootScope,
			$state;

	// Load the modules
	beforeEach(module("ui.router", _$urlRouterProvider_ => {
		$urlRouterProvider = _$urlRouterProvider_;
		sinon.stub($urlRouterProvider, "otherwise");
	}));

	beforeEach(module("lootMocks", "lootApp", mockDependenciesProvider => mockDependenciesProvider.load(["$state"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$http_, _$rootScope_, _$state_) => {
		$http = _$http_;
		$rootScope = _$rootScope_;
		$state = _$state_;
	}));

	describe("config", () => {
		it("should default all HTTP calls to JSON", () => $http.defaults.headers.common.Accept.should.equal("application/json"));

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

				sinon.stub(console, "log");

				$rootScope.stateChangeErrorHandler(null, toState, toParams, fromState, fromParams, error);
				console.log.should.have.been.calledWith(toState, toParams, fromState, fromParams);
			});
		});

		it("should attach a state change error handler", () => {
			sinon.stub($rootScope, "stateChangeErrorHandler");
			$rootScope.$emit("$stateChangeError");
			$rootScope.stateChangeErrorHandler.should.have.been.called;
		});
	});
});
