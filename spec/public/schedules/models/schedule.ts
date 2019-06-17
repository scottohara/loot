import {
	ScheduledBasicTransaction,
	ScheduledTransaction
} from "schedules/types";
import {
	createScheduledBasicTransaction,
	createScheduledSecurityHoldingTransaction
} from "mocks/schedules/factories";
import {
	format,
	startOfDay
} from "date-fns/esm";
import { CategoryModelMock } from "mocks/categories/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { PayeeModelMock } from "mocks/payees/types";
import ScheduleModel from "schedules/models/schedule";
import { SecurityModelMock } from "mocks/securities/types";
import angular from "angular";
import sinon from "sinon";

describe("scheduleModel", (): void => {
	let	scheduleModel: ScheduleModel,
			$httpBackend: angular.IHttpBackendService,
			payeeModel: PayeeModelMock,
			categoryModel: CategoryModelMock,
			securityModel: SecurityModelMock;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSchedules", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["payeeModel", "categoryModel", "securityModel"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_scheduleModel_: ScheduleModel, _$httpBackend_: angular.IHttpBackendService, _payeeModel_: PayeeModelMock, _categoryModel_: CategoryModelMock, _securityModel_: SecurityModelMock): void => {
		scheduleModel = _scheduleModel_;

		$httpBackend = _$httpBackend_;

		payeeModel = _payeeModel_;
		categoryModel = _categoryModel_;
		securityModel = _securityModel_;
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	describe("path", (): void => {
		it("should return the schedules collection path when an id is not provided", (): Chai.Assertion => scheduleModel.path().should.equal("/schedules"));

		it("should return a specific schedule path when an id is provided", (): Chai.Assertion => scheduleModel.path(123).should.equal("/schedules/123"));
	});

	describe("parse", (): void => {
		let schedule: ScheduledTransaction;

		beforeEach((): ScheduledTransaction => (schedule = scheduleModel["parse"](createScheduledBasicTransaction({ next_due_date: format(new Date(), "YYYY-MM-DD HH:mm:ss") }))));

		it("should convert the next due date from a string to a date", (): void => {
			schedule.next_due_date.should.be.a("date");
			schedule.next_due_date.should.deep.equal(startOfDay(new Date()));
		});
	});

	describe("stringify", (): void => {
		let schedule: ScheduledTransaction;

		beforeEach((): ScheduledTransaction => (schedule = scheduleModel["stringify"](createScheduledBasicTransaction({ next_due_date: startOfDay(new Date()) }))));

		it("should convert the next due date from a date to a string", (): void => {
			schedule.next_due_date.should.be.a("string");
			schedule.next_due_date.should.deep.equal(format(new Date(), "YYYY-MM-DD"));
		});
	});

	describe("all", (): void => {
		const expectedResponse: string[] = ["schedule 1", "schedule 2"];
		let actualResponse: angular.IPromise<ScheduledTransaction[]>;

		beforeEach((): void => {
			scheduleModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/schedules/u).respond(200, expectedResponse);
			actualResponse = scheduleModel.all();
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /schedules", (): null => null);

		it("should parse each schedule returned", (): Chai.Assertion => scheduleModel["parse"].should.have.been.calledTwice);

		it("should return a list of all schedules", (): void => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("save", (): void => {
		const expectedResponse = "schedule";

		beforeEach((): void => {
			scheduleModel["stringify"] = sinon.stub().returnsArg(0);
			scheduleModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.whenPOST(/schedules$/u).respond(200, expectedResponse);
			$httpBackend.whenPATCH(/schedules\/1$/u).respond(200, expectedResponse);
		});

		it("should flush the payee cache when the schedule payee is new", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1, payee: "" }));
			payeeModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the payee cache when the schedule payee is existing", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			payeeModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the category cache when the schedule category is new", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1, category: "" }));
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the category cache when the schedule category is existing", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			categoryModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the category cache when the schedule subcategory is new", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1, subcategory: "" }));
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the category cache when the schedule subcategory is existing", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			categoryModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the security cache when the schedule security is new", (): void => {
			scheduleModel.save(createScheduledSecurityHoldingTransaction({ id: 1, security: "" }));
			securityModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the security cache when the schedule security is existing", (): void => {
			scheduleModel.save(createScheduledSecurityHoldingTransaction({ id: 1 }));
			securityModel.flush.should.not.have.been.called;
			$httpBackend.flush();
		});

		it("should stringify the schedule", (): void => {
			const schedule: ScheduledBasicTransaction = createScheduledBasicTransaction({ id: 1 });

			scheduleModel.save(schedule);
			scheduleModel["stringify"].should.have.been.calledWith(schedule);
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /schedules when an id is not provided", (): void => {
			const schedule: ScheduledBasicTransaction = createScheduledBasicTransaction();

			delete schedule.id;
			$httpBackend.expectPOST(/schedules$/u, schedule);
			scheduleModel.save(schedule);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /schedules/{id} when an id is provided", (): void => {
			const schedule: ScheduledBasicTransaction = createScheduledBasicTransaction({ id: 1 });

			$httpBackend.expectPATCH(/schedules\/1$/u, schedule);
			scheduleModel.save(schedule);
			$httpBackend.flush();
		});

		it("should parse the schedule", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			$httpBackend.flush();
			scheduleModel["parse"].should.have.been.calledWith(expectedResponse);
		});

		it("should return the schedule", (): void => {
			const actualResponse: angular.IPromise<ScheduledTransaction> = scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));

			$httpBackend.flush();
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("destroy", (): void => {
		it("should dispatch a DELETE request to /schedules/{id}", (): void => {
			$httpBackend.expectDELETE(/schedules\/1$/u).respond(200);
			scheduleModel.destroy(createScheduledBasicTransaction({ id: 1 }));
			$httpBackend.flush();
		});
	});
});
