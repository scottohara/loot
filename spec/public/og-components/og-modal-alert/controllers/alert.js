(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogModalAlertController", function() {
		// The object under test
		var ogModalAlertController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				alert;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "alert"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _alert_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			alert = _alert_;
			ogModalAlertController = controllerTest("ogModalAlertController");
		}));

		it("should make the passed alert available on the $scope", function() {
			ogModalAlertController.alert.message.should.equal(alert.message);
			ogModalAlertController.alert.closeButtonStyle.should.equal("primary");
		});

		it("should override the default button style with a specified style", function() {
			alert.closeButtonStyle = "overridden";
			ogModalAlertController = controllerTest("ogModalAlertController");
			ogModalAlertController.alert.closeButtonStyle.should.equal(alert.closeButtonStyle);
		});

		describe("close", function() {
			it("should dismiss the modal", function() {
				ogModalAlertController.close();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
