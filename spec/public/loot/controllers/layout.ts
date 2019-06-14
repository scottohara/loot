import {
	StateMock,
	UibModalMock
} from "mocks/node-modules/angular/types";
import sinon, {SinonStub} from "sinon";
import {AuthenticationModelMock} from "mocks/authentication/types";
import {ControllerTestFactory} from "mocks/types";
import LayoutController from "loot/controllers/layout";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";

describe("LayoutController", (): void => {
	let	layoutController: LayoutController,
			controllerTest: ControllerTestFactory,
			$window: angular.IWindowService,
			$transitions: angular.ui.IStateParamsService,
			$state: StateMock,
			$uibModal: UibModalMock,
			authenticationModel: AuthenticationModelMock,
			ogTableNavigableService: OgTableNavigableService,
			authenticated: boolean,
			mockJQueryInstance: MockJQueryInstance,
			realJQueryInstance: JQuery;

	class MockJQueryInstance {
		private readonly events: {[event: string]: () => void;} = {};

		public on(event: string, handler: () => void): void {
			this.events[event] = handler;
		}
	}

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootApp", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$state", "$uibModal", "ogNavigatorServiceWorkerService", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "authenticated"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$window_: angular.IWindowService, _$transitions_: angular.ui.IStateParamsService, _$state_: StateMock, _$uibModal_: UibModalMock, _authenticationModel_: AuthenticationModelMock, _ogTableNavigableService_: OgTableNavigableService, _authenticated_: boolean): void => {
		controllerTest = _controllerTest_;
		$window = _$window_;
		$transitions = _$transitions_;
		$state = _$state_;
		$uibModal = _$uibModal_;
		authenticationModel = _authenticationModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		authenticated = _authenticated_;

		mockJQueryInstance = new MockJQueryInstance();
		realJQueryInstance = $window.$;
		$window.$ = sinon.stub();
		$window.$.withArgs("#transactionSearch").returns(mockJQueryInstance);

		layoutController = controllerTest("LayoutController") as LayoutController;
	}));

	afterEach((): JQuery => ($window.$ = realJQueryInstance));

	it("should make the authentication status available to the view", (): Chai.Assertion => layoutController.authenticated.should.equal(authenticated));

	it("should make the scrollTo function available to the view", (): Chai.Assertion => layoutController.scrollTo.should.be.a("function"));

	it("should hide the state loading spinner by default", (): Chai.Assertion => layoutController.loadingState.should.be.false);

	describe("login", (): void => {
		beforeEach((): void => layoutController.login());

		it("should show the login modal", (): Chai.Assertion => $uibModal.open.should.have.been.calledWithMatch({controller: "AuthenticationEditController"}));

		it("should reload the current state when the login modal is closed", (): void => {
			$uibModal.close();
			$state.reload.should.have.been.called;
		});

		it("should not reload the current state when the login modal is dismissed", (): void => {
			$uibModal.dismiss();
			$state.reload.should.not.have.been.called;
		});
	});

	describe("logout", (): void => {
		beforeEach((): void => layoutController.logout());

		it("should logout the user", (): Chai.Assertion => authenticationModel.logout.should.have.been.called);

		it("should reload the current state", (): Chai.Assertion => $state.reload.should.have.been.called);
	});

	describe("search", (): void => {
		it("should do nothing if the search query is empty", (): void => {
			layoutController.queryService.query = "";
			layoutController.search();
			$state.go.should.not.have.been.called;
		});

		it("should transition to the transaction search state passing the query", (): void => {
			layoutController.queryService.query = "search query";
			layoutController.search();
			$state.go.should.have.been.calledWith("root.transactions", {query: "search query"});
		});
	});

	describe("toggleTableNavigationEnabled", (): void => {
		it("should toggle the table navigable enabled flag", (): void => {
			ogTableNavigableService.enabled = true;
			layoutController.toggleTableNavigationEnabled(false);
			ogTableNavigableService.enabled.should.be.false;
		});
	});

	describe("recentlyAccessedAccounts", (): void => {
		it("should return the list of recent accounts", (): Chai.Assertion => layoutController.recentlyAccessedAccounts.should.equal("recent accounts list"));
	});

	describe("recentlyAccessedPayees", (): void => {
		it("should return the list of recent payees", (): Chai.Assertion => layoutController.recentlyAccessedPayees.should.equal("recent payees list"));
	});

	describe("recentlyAccessedCategories", (): void => {
		it("should return the list of recent categories", (): Chai.Assertion => layoutController.recentlyAccessedCategories.should.equal("recent categories list"));
	});

	describe("recentlyAccessedSecurities", (): void => {
		it("should return the list of recent securities", (): Chai.Assertion => layoutController.recentlyAccessedSecurities.should.equal("recent securities list"));
	});

	describe("loadingState", (): void => {
		it("should set a flag to indicate whether a state is loading", (): void => {
			layoutController["isLoadingState"] = false;
			layoutController.loadingState = true;
			layoutController["isLoadingState"].should.be.true;
			layoutController.loadingState.should.be.true;
		});
	});

	describe("checkIfSearchCleared", (): void => {
		it("should do nothing if the search query is not empty", (): void => {
			layoutController.queryService.query = "search query";
			layoutController.queryService.previousState = {};
			layoutController["checkIfSearchCleared"]();
			$state.go.should.not.have.been.called;
		});

		it("should do nothing if a previous state is not set", (): void => {
			layoutController.queryService.query = "";
			layoutController.queryService.previousState = null;
			layoutController["checkIfSearchCleared"]();
			$state.go.should.not.have.been.called;
		});

		describe("(search field cleared)", (): void => {
			let previousStateName: string,
					previousStateParams: string;

			beforeEach((): void => {
				previousStateName = "previous state";
				previousStateParams = "previous params";
				layoutController.queryService.query = "";
				layoutController.queryService.previousState = {name: previousStateName, params: previousStateParams};
				layoutController["checkIfSearchCleared"]();
			});

			it("should transition to the previous state when the search field is cleared", (): Chai.Assertion => $state.go.should.have.been.calledWith(previousStateName, previousStateParams));

			it("should clear the stored previous state", (): Chai.Assertion => (!layoutController.queryService.previousState).should.be.true);
		});
	});

	describe("state transitions", (): void => {
		let mockTransition: {promise: {finally: SinonStub;};},
				deregisterTransitionStartHook: SinonStub;

		beforeEach((): void => {
			mockTransition = {
				promise: {
					finally: sinon.stub()
				}
			};
			deregisterTransitionStartHook = sinon.stub();
			sinon.stub($transitions, "onStart").yields(mockTransition).returns(deregisterTransitionStartHook);
			layoutController = controllerTest("LayoutController") as LayoutController;
		});

		it("should register a start transition hook", (): Chai.Assertion => $transitions.onStart.should.have.been.calledWith({}, sinon.match.func));

		it("should deregister the start transition hook when the scope is destroyed", (): void => {
			(layoutController as angular.IController).$scope.$emit("$destroy");
			deregisterTransitionStartHook.should.have.been.called;
		});

		describe("on transition start", (): void => {
			it("should set the loading state", (): Chai.Assertion => layoutController.loadingState.should.be.true);

			it("should register a callback for when the transition ends", (): Chai.Assertion => mockTransition.promise.finally.should.have.been.calledWith(sinon.match.func));
		});

		describe("on transition end", (): void => {
			beforeEach((): void => {
				mockTransition.promise.finally.yields();
				layoutController = controllerTest("LayoutController") as LayoutController;
			});

			it("should clear the loading state", (): Chai.Assertion => layoutController.loadingState.should.be.false);
		});
	});

	describe("on search", (): void => {
		beforeEach((): SinonStub => sinon.stub(layoutController, "checkIfSearchCleared" as keyof LayoutController));

		it("should check if the search field was cleared", (): void => {
			mockJQueryInstance["events"].search();
			layoutController["checkIfSearchCleared"].should.have.been.called;
		});
	});
});
