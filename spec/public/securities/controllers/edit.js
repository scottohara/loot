(function() {
	"use strict";

	/*jshint expr: true */

	describe("securityEditController", function() {
		// The object under test
		var securityEditController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				securityModel,
				security;

		// Load the modules
		beforeEach(module("lootMocks", "securities", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "securityModel", "security"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _securityModel_, _security_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			securityModel = _securityModel_;
			security = _security_;
			securityEditController = controllerTest("securityEditController");
		}));

		describe("when a security is provided", function() {
			it("should make the passed security available on the $scope", function() {
				securityEditController.security.should.deep.equal(security);
			});
			
			it("should set the mode to Edit", function() {
				securityEditController.mode.should.equal("Edit");
			});
		});

		describe("when a security is not provided", function() {
			beforeEach(function() {
				securityEditController = controllerTest("securityEditController", {security: undefined});
			});

			it("should set an empty security object on the $scope", function() {
				securityEditController.security.should.be.an.Object;
				securityEditController.security.should.be.empty;
			});

			it("should set the mode to Add", function() {
				securityEditController.mode.should.equal("Add");
			});
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				securityEditController.errorMessage = "error message";
				securityEditController.save();
				(null === securityEditController.errorMessage).should.be.true;
			});

			it("should save the security", function() {
				securityEditController.save();
				securityModel.save.should.have.been.calledWith(security);
			});

			it("should close the modal when the security save is successful", function() {
				securityEditController.save();
				$modalInstance.close.should.have.been.calledWith(security);
			});

			it("should display an error message when login unsuccessful", function() {
				securityEditController.security.id = -1;
				securityEditController.save();
				securityEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				securityEditController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
