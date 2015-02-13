(function() {
	"use strict";

	/*jshint expr: true */

	describe("LayoutController", function() {
		// The object under test
		var layoutController;

		// Dependencies
		var $state,
				$modal,
				authenticationModel,
				accountModel,
				payeeModel,
				categoryModel,
				securityModel,
				ogTableNavigableService,
				authenticated;

		// Load the modules
		beforeEach(module("lootMocks", "loot", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$state", "$modal", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "authenticated"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$state_, _$modal_, _authenticationModel_, _accountModel_, _payeeModel_, _categoryModel_, _securityModel_, _ogTableNavigableService_, _authenticated_) {
			$state = _$state_;
			$modal = _$modal_;
			authenticationModel = _authenticationModel_;
			accountModel = _accountModel_;
			payeeModel = _payeeModel_;
			categoryModel = _categoryModel_;
			securityModel = _securityModel_;
			ogTableNavigableService = _ogTableNavigableService_;
			authenticated = _authenticated_;
			layoutController = controllerTest("LayoutController");
		}));

		it("should make the authentication status available to the view", function() {
			layoutController.authenticated.should.equal(authenticated);
		});

		it("should make the scrollTo function available to the view", function() {
			layoutController.scrollTo.should.be.a.function;
		});

		describe("login", function() {
			beforeEach(function() {
				layoutController.login();
			});

			it("should show the login modal", function() {
				$modal.open.should.have.been.calledWith(sinon.match({
					controller: "AuthenticationEditController"
				}));
			});

			it("should reload the current state when the login modal is closed", function() {
				$modal.close();
				$state.reload.should.have.been.called;
			});

			it("should not reload the current state when the login modal is dismissed", function() {
				$modal.dismiss();
				$state.reload.should.not.have.been.called;
			});
		});

		describe("logout", function() {
			beforeEach(function() {
				layoutController.logout();
			});

			it("should logout the user", function() {
				authenticationModel.logout.should.have.been.called;
			});

			it("should reload the current state", function() {
				$state.reload.should.have.been.called;
			});
		});

		describe("search", function() {
			it("should transition to the transaction search state passing the query", function() {
				layoutController.queryService.query = "search query";
				layoutController.search();
				$state.go.should.have.been.calledWith("root.transactions", {query: "search query"});
			});
		});

		describe("toggleTableNavigationEnabled", function() {
			it("should toggle the table navigable enabled flag", function() {
				ogTableNavigableService.enabled = true;
				layoutController.toggleTableNavigationEnabled(false);
				ogTableNavigableService.enabled.should.be.false;
			});
		});

		describe("recentlyAccessedAccounts", function() {
			it("should return the list of recent accounts", function() {
				layoutController.recentlyAccessedAccounts().should.equal("recent accounts list");
			});
		});

		describe("recentlyAccessedPayees", function() {
			it("should return the list of recent payees", function() {
				layoutController.recentlyAccessedPayees().should.equal("recent payees list");
			});
		});

		describe("recentlyAccessedCategories", function() {
			it("should return the list of recent categories", function() {
				layoutController.recentlyAccessedCategories().should.equal("recent categories list");
			});
		});

		describe("recentlyAccessedSecurities", function() {
			it("should return the list of recent securities", function() {
				layoutController.recentlyAccessedSecurities().should.equal("recent securities list");
			});
		});
	});
})();
