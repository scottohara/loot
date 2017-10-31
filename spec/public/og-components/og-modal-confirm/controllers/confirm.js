import angular from "angular";

describe("OgModalConfirmController", () => {
	let	ogModalConfirmController,
			controllerTest,
			$uibModalInstance,
			confirm;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "confirm"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _confirm_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		confirm = _confirm_;
		ogModalConfirmController = controllerTest("OgModalConfirmController");
	}));

	it("should make the passed confirmation details available on the $scope", () => {
		ogModalConfirmController.confirm.message.should.equal(confirm.message);
		ogModalConfirmController.confirm.noButtonStyle.should.equal("default");
		ogModalConfirmController.confirm.yesButtonStyle.should.equal("primary");
	});

	it("should override the default button styles with the specified styles", () => {
		confirm.noButtonStyle = "overridden no";
		confirm.yesButtonStyle = "overridden yes";
		ogModalConfirmController = controllerTest("OgModalConfirmController");
		ogModalConfirmController.confirm.noButtonStyle.should.equal(confirm.noButtonStyle);
		ogModalConfirmController.confirm.yesButtonStyle.should.equal(confirm.yesButtonStyle);
	});

	describe("yes", () => {
		it("should close the modal and return true", () => {
			ogModalConfirmController.yes();
			$uibModalInstance.close.should.have.been.calledWith(true);
		});
	});

	describe("no", () => {
		it("should dismiss the modal", () => {
			ogModalConfirmController.no();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
