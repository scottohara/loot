describe("scheduleModel", () => {
	let	scheduleModel,
			$httpBackend,
			payeeModel,
			categoryModel,
			securityModel;

	// Load the modules
	beforeEach(module("lootMocks", "lootSchedules", mockDependenciesProvider => mockDependenciesProvider.load(["payeeModel", "categoryModel", "securityModel"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_scheduleModel_, _$httpBackend_, _payeeModel_, _categoryModel_, _securityModel_) => {
		scheduleModel = _scheduleModel_;

		$httpBackend = _$httpBackend_;

		payeeModel = _payeeModel_;
		categoryModel = _categoryModel_;
		securityModel = _securityModel_;
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach(() => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	describe("path", () => {
		it("should return the schedules collection path when an id is not provided", () => scheduleModel.path().should.equal("/schedules"));

		it("should return a specific schedule path when an id is provided", () => scheduleModel.path(123).should.equal("/schedules/123"));
	});

	describe("parse", () => {
		let schedule;

		beforeEach(() => (schedule = scheduleModel.parse({next_due_date: moment().format("YYYY-MM-DD HH:mm:ss")})));

		it("should convert the next due date from a string to a date", () => {
			schedule.next_due_date.should.be.a.Date;
			schedule.next_due_date.should.deep.equal(moment().startOf("day").toDate());
		});
	});

	describe("stringify", () => {
		let schedule;

		beforeEach(() => (schedule = scheduleModel.stringify({next_due_date: moment().startOf("day").toDate()})));

		it("should convert the next due date from a date to a string", () => {
			schedule.next_due_date.should.be.a.String;
			schedule.next_due_date.should.deep.equal(moment().format("YYYY-MM-DD"));
		});
	});

	describe("all", () => {
		const expectedResponse = ["schedule 1", "schedule 2"];
		let actualResponse;

		beforeEach(() => {
			scheduleModel.parse = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/schedules/).respond(200, expectedResponse);
			actualResponse = scheduleModel.all();
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /schedules", () => null);

		it("should parse each schedule returned", () => scheduleModel.parse.should.have.been.calledTwice);

		it("should return a list of all schedules", () => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("save", () => {
		const expectedResponse = "schedule";

		beforeEach(() => {
			scheduleModel.stringify = sinon.stub().returnsArg(0);
			scheduleModel.parse = sinon.stub().returnsArg(0);
			$httpBackend.whenPOST(/schedules$/).respond(200, expectedResponse);
			$httpBackend.whenPATCH(/schedules\/123$/).respond(200, expectedResponse);
		});

		it("should flush the payee cache when the schedule payee is new", () => {
			scheduleModel.save({payee: ""});
			payeeModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the payee cache when the schedule payee is existing", () => {
			scheduleModel.save({payee: {}});
			payeeModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the category cache when the schedule category is new", () => {
			scheduleModel.save({category: ""});
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the category cache when the schedule category is existing", () => {
			scheduleModel.save({category: {}});
			categoryModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the category cache when the schedule subcategory is new", () => {
			scheduleModel.save({subcategory: ""});
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the category cache when the schedule subcategory is existing", () => {
			scheduleModel.save({subcategory: {}});
			categoryModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the security cache when the schedule security is new", () => {
			scheduleModel.save({security: ""});
			securityModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the security cache when the schedule security is existing", () => {
			scheduleModel.save({security: {}});
			securityModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should stringify the schedule", () => {
			const schedule = {};

			scheduleModel.save(schedule);
			scheduleModel.stringify.should.have.been.calledWith(schedule);
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /schedules when an id is not provided", () => {
			$httpBackend.expectPOST(/schedules$/, {});
			scheduleModel.save({});
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /schedules/{id} when an id is provided", () => {
			$httpBackend.expectPATCH(/schedules\/123$/, {id: 123});
			scheduleModel.save({id: 123});
			$httpBackend.flush();
		});

		it("should parse the schedule", () => {
			scheduleModel.save({});
			$httpBackend.flush();
			scheduleModel.parse.should.have.been.calledWith(expectedResponse);
		});

		it("should return the schedule", () => {
			const actualResponse = scheduleModel.save({});

			$httpBackend.flush();
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("destroy", () => {
		it("should dispatch a DELETE request to /schedules/{id}", () => {
			$httpBackend.expectDELETE(/schedules\/123$/).respond(200);
			scheduleModel.destroy({id: 123});
			$httpBackend.flush();
		});
	});
});
