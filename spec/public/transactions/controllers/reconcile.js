(function() {
	"use strict";

	/*jshint expr: true */

	describe("transactionReconcileController", function() {
		// The object under test
		var transactionReconcileController;

		// Dependencies
		var $modalInstance,
				$window,
				account;

		// Load the modules
		beforeEach(module("lootMocks", "transactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "$window", "account"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _$window_, _account_) {
			$modalInstance = _$modalInstance_;
			$window = _$window_;
			account = _account_;
			transactionReconcileController = controllerTest("transactionReconcileController");
		}));

		it("should fetch the closing balance from localStorage and make it available on the $scope", function() {
			$window.localStorage.getItem.should.have.been.calledWith("lootClosingBalance-1");
			transactionReconcileController.account.closingBalance.should.equal(1000);
		});

		describe("start", function() {
			it("should save the closing balance to localStorage", function() {
				transactionReconcileController.start();
				$window.localStorage.setItem.should.have.been.calledWith("lootClosingBalance-1", 1000);
			});

			it("should close the modal when the transaction delete is successful", function() {
				transactionReconcileController.start();
				$modalInstance.close.should.have.been.calledWith(1000);
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				transactionReconcileController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
