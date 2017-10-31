import angular from "angular";

describe("SecurityEditController", () => {
	let	securityEditController,
			controllerTest,
			$uibModalInstance,
			securityModel,
			security;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSecurities", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "securityModel", "security"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _securityModel_, _security_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		securityModel = _securityModel_;
		security = _security_;
		securityEditController = controllerTest("SecurityEditController");
	}));

	describe("when a security is provided", () => {
		it("should make the passed security available to the view", () => securityEditController.security.should.deep.equal(security));

		it("should set the mode to Edit", () => securityEditController.mode.should.equal("Edit"));
	});

	describe("when a security is not provided", () => {
		beforeEach(() => (securityEditController = controllerTest("SecurityEditController", {security: null})));

		it("should make an empty security object available to the view", () => {
			securityEditController.security.should.be.an.Object;
			securityEditController.security.should.be.empty;
		});

		it("should set the mode to Add", () => securityEditController.mode.should.equal("Add"));
	});

	describe("save", () => {
		it("should reset any previous error messages", () => {
			securityEditController.errorMessage = "error message";
			securityEditController.save();
			(null === securityEditController.errorMessage).should.be.true;
		});

		it("should save the security", () => {
			securityEditController.save();
			securityModel.save.should.have.been.calledWith(security);
		});

		it("should close the modal when the security save is successful", () => {
			securityEditController.save();
			$uibModalInstance.close.should.have.been.calledWith(security);
		});

		it("should display an error message when the security save is unsuccessful", () => {
			securityEditController.security.id = -1;
			securityEditController.save();
			securityEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			securityEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
