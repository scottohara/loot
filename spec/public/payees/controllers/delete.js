(function() {
	"use strict";

	/*jshint expr: true */

	describe("PayeeDeleteController", function() {
		// The object under test
		var payeeDeleteController;

		// Dependencies
		var $modalInstance,
				payeeModel,
				payee;

		// Load the modules
		beforeEach(module("lootMocks", "payees", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "payeeModel", "payee"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _payeeModel_, _payee_) {
			$modalInstance = _$modalInstance_;
			payeeModel = _payeeModel_;
			payee = _payee_;
			payeeDeleteController = controllerTest("PayeeDeleteController");
		}));

		it("should make the passed payee available to the view", function() {
			payeeDeleteController.payee.should.deep.equal(payee);
		});

		describe("deletePayee", function() {
			it("should reset any previous error messages", function() {
				payeeDeleteController.errorMessage = "error message";
				payeeDeleteController.deletePayee();
				(null === payeeDeleteController.errorMessage).should.be.true;
			});

			it("should delete the payee", function() {
				payeeDeleteController.deletePayee();
				payeeModel.destroy.should.have.been.calledWith(payee);
			});

			it("should close the modal when the payee delete is successful", function() {
				payeeDeleteController.deletePayee();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the payee delete is unsuccessful", function() {
				payeeDeleteController.payee.id = -1;
				payeeDeleteController.deletePayee();
				payeeDeleteController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				payeeDeleteController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
