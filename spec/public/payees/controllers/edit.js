(function() {
	"use strict";

	/*jshint expr: true */

	describe("PayeeEditController", function() {
		// The object under test
		var payeeEditController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				payeeModel,
				payee;

		// Load the modules
		beforeEach(module("lootMocks", "payees", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "payeeModel", "payee"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _payeeModel_, _payee_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			payeeModel = _payeeModel_;
			payee = _payee_;
			payeeEditController = controllerTest("PayeeEditController");
		}));

		describe("when a payee is provided", function() {
			it("should make the passed payee available to the view", function() {
				payeeEditController.payee.should.deep.equal(payee);
			});
			
			it("should set the mode to Edit", function() {
				payeeEditController.mode.should.equal("Edit");
			});
		});

		describe("when a payee is not provided", function() {
			beforeEach(function() {
				payeeEditController = controllerTest("PayeeEditController", {payee: undefined});
			});

			it("should make an empty payee object available to the view", function() {
				payeeEditController.payee.should.be.an.Object;
				payeeEditController.payee.should.be.empty;
			});

			it("should set the mode to Add", function() {
				payeeEditController.mode.should.equal("Add");
			});
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				payeeEditController.errorMessage = "error message";
				payeeEditController.save();
				(null === payeeEditController.errorMessage).should.be.true;
			});

			it("should save the payee", function() {
				payeeEditController.save();
				payeeModel.save.should.have.been.calledWith(payee);
			});

			it("should close the modal when the payee save is successful", function() {
				payeeEditController.save();
				$modalInstance.close.should.have.been.calledWith(payee);
			});

			it("should display an error message when login unsuccessful", function() {
				payeeEditController.payee.id = -1;
				payeeEditController.save();
				payeeEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				payeeEditController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
