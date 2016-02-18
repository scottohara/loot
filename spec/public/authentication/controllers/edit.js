describe("AuthenticationEditController", () => {
	let	authenticationEditController,
			$uibModalInstance,
			authenticationModel;

	// Load the modules
	beforeEach(module("lootMocks", "lootAuthentication", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "authenticationModel"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$uibModalInstance_, _authenticationModel_) => {
		$uibModalInstance = _$uibModalInstance_;
		authenticationModel = _authenticationModel_;
		authenticationEditController = controllerTest("AuthenticationEditController");
	}));

	it("should set null authentication credentials to the view", () => {
		(null === authenticationEditController.userName).should.be.true;
		(null === authenticationEditController.password).should.be.true;
	});

	describe("login", () => {
		beforeEach(() => {
			authenticationEditController.userName = "gooduser";
			authenticationEditController.password = "goodpassword";
		});

		it("should reset any previous error messages", () => {
			authenticationEditController.errorMessage = "error message";
			authenticationEditController.login();
			(null === authenticationEditController.errorMessage).should.be.true;
		});

		it("should attempt to login with the username & password", () => {
			authenticationEditController.login();
			authenticationModel.login.should.have.been.calledWith("gooduser", "goodpassword");
		});

		it("should close the modal when login successful", () => {
			authenticationEditController.login();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when login unsuccessful", () => {
			authenticationEditController.userName = "baduser";
			authenticationEditController.password = "badpassword";
			authenticationEditController.login();
			authenticationEditController.errorMessage.should.equal("unsuccessful");
			authenticationEditController.loginInProgress.should.be.false;
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			authenticationEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
