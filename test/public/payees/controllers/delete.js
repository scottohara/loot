(function() {
	"use strict";

	/*jshint expr: true */

	describe("payeeDeleteController", function() {
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
			payeeDeleteController = controllerTest("payeeDeleteController");
		}));

		it("should make the passed payee available on the $scope", function() {
			payeeDeleteController.payee.should.deep.equal(payee);
		});

		describe("delete", function() {
			it("should reset any previous error messages", function() {
				payeeDeleteController.errorMessage = "error message";
				payeeDeleteController.delete();
				(null === payeeDeleteController.errorMessage).should.be.true;
			});

			it("should call payeeModel.destroy() with the payee", function() {
				payeeDeleteController.delete();
				payeeModel.destroy.should.have.been.calledWith(payee);
			});

			it("should close the modal when the payee delete is successful", function() {
				payeeDeleteController.delete();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the payee delete is unsuccessful", function() {
				payeeDeleteController.payee.id = -1;
				payeeDeleteController.delete();
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
