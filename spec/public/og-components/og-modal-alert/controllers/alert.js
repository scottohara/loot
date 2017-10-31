import angular from "angular";

describe("OgModalAlertController", () => {
	let	ogModalAlertController,
			controllerTest,
			$uibModalInstance,
			alert;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "alert"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _alert_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		alert = _alert_;
		ogModalAlertController = controllerTest("OgModalAlertController");
	}));

	it("should make the passed alert available to the view", () => {
		ogModalAlertController.alert.message.should.equal(alert.message);
		ogModalAlertController.alert.closeButtonStyle.should.equal("primary");
	});

	it("should override the default button style with a specified style", () => {
		alert.closeButtonStyle = "overridden";
		ogModalAlertController = controllerTest("OgModalAlertController");
		ogModalAlertController.alert.closeButtonStyle.should.equal(alert.closeButtonStyle);
	});

	describe("closeModal", () => {
		it("should dismiss the modal", () => {
			ogModalAlertController.closeModal();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
