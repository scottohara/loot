(function() {
	"use strict";

	/*jshint expr: true */

	describe("SecurityDeleteController", function() {
		// The object under test
		var securityDeleteController;

		// Dependencies
		var $modalInstance,
				securityModel,
				security;

		// Load the modules
		beforeEach(module("lootMocks", "lootSecurities", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "securityModel", "security"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _securityModel_, _security_) {
			$modalInstance = _$modalInstance_;
			securityModel = _securityModel_;
			security = _security_;
			securityDeleteController = controllerTest("SecurityDeleteController");
		}));

		it("should make the passed security available to the view", function() {
			securityDeleteController.security.should.deep.equal(security);
		});

		describe("deleteSecurity", function() {
			it("should reset any previous error messages", function() {
				securityDeleteController.errorMessage = "error message";
				securityDeleteController.deleteSecurity();
				(null === securityDeleteController.errorMessage).should.be.true;
			});

			it("should delete the security", function() {
				securityDeleteController.deleteSecurity();
				securityModel.destroy.should.have.been.calledWith(security);
			});

			it("should close the modal when the security delete is successful", function() {
				securityDeleteController.deleteSecurity();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the security delete is unsuccessful", function() {
				securityDeleteController.security.id = -1;
				securityDeleteController.deleteSecurity();
				securityDeleteController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				securityDeleteController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
