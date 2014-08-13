(function() {
	"use strict";

	/*jshint expr: true */

	describe("layoutController", function() {
		// The object under test
		var layoutController;

		// Dependencies
		var $state,
				$modal,
				authenticationModel,
				accountModel,
				payeeModel,
				categoryModel,
				securityModel;

		// Load the modules
		beforeEach(module("lootMocks", "loot", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$state", "$modal", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$state_, _$modal_, _authenticationModel_, _accountModel_, _payeeModel_, _categoryModel_, _securityModel_) {
			$state = _$state_;
			$modal = _$modal_;
			authenticationModel = _authenticationModel_;
			accountModel = _accountModel_;
			payeeModel = _payeeModel_;
			categoryModel = _categoryModel_;
			securityModel = _securityModel_;
			layoutController = controllerTest("layoutController");
		}));

		it("should make the authentication status available on the $scope", function() {
			layoutController.isAuthenticated.should.equal(authenticationModel.isAuthenticated);
		});

		describe("login", function() {
			beforeEach(function() {
				layoutController.login();
			});

			it("should shown the login modal", function() {
				$modal.open.should.have.been.calledWith(sinon.match({
					controller: "authenticationEditController"
				}));
			});

			it("should reload the current state when the login modal returns", function() {
				$state.reload.should.have.been.called;
			});
		});

		describe("logout", function() {
			beforeEach(function() {
				layoutController.logout();
			});

			it("should call authenticationModel.logout()", function() {
				authenticationModel.logout.should.have.been.called;
			});

			it("should reload the current state", function() {
				$state.reload.should.have.been.called;
			});
		});

		describe("search", function() {
			it("should transition to the transaction search state passing the query", function() {
				layoutController.query = "search query";
				layoutController.search();
				$state.go.should.have.been.calledWith("root.transactions", {query: "search query"});
			});
		});

		describe("toggleNavigationGloballyDisabled", function() {
			it("should toggle the navigationGloballyDisabled flag", function() {
				layoutController.navigationGloballyDisabled = false;
				layoutController.toggleNavigationGloballyDisabled(true);
				layoutController.navigationGloballyDisabled.should.be.true;
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
