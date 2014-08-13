(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogModalConfirmController", function() {
		// The object under test
		var ogModalConfirmController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				confirm;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "confirm"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _confirm_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			confirm = _confirm_;
			ogModalConfirmController = controllerTest("ogModalConfirmController");
		}));

		it("should make the passed confirmation details available on the $scope", function() {
			ogModalConfirmController.confirm.message.should.equal(confirm.message);
			ogModalConfirmController.confirm.noButtonStyle.should.equal("default");
			ogModalConfirmController.confirm.yesButtonStyle.should.equal("primary");
		});

		it("should override the default button styles with the specified styles", function() {
			confirm.noButtonStyle = "overridden no";
			confirm.yesButtonStyle = "overridden yes";
			ogModalConfirmController = controllerTest("ogModalConfirmController");
			ogModalConfirmController.confirm.noButtonStyle.should.equal(confirm.noButtonStyle);
			ogModalConfirmController.confirm.yesButtonStyle.should.equal(confirm.yesButtonStyle);
		});

		describe("yes", function() {
			it("should close the modal and return true", function() {
				ogModalConfirmController.yes();
				$modalInstance.close.should.have.been.calledWith(true);
			});
		});

		describe("no", function() {
			it("should dismiss the modal", function() {
				ogModalConfirmController.no();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
