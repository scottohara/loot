import type {
	ScheduledBasicTransaction,
	ScheduledTransaction,
} from "~/schedules/types";
import {
	createScheduledBasicTransaction,
	createScheduledSecurityHoldingTransaction,
} from "~/mocks/schedules/factories";
import { lightFormat, startOfDay } from "date-fns";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type ScheduleModel from "~/schedules/models/schedule";
import type { SecurityModelMock } from "~/mocks/securities/types";
import angular from "angular";
import sinon from "sinon";

describe("scheduleModel", (): void => {
	let scheduleModel: ScheduleModel,
		$httpBackend: angular.IHttpBackendService,
		payeeModel: PayeeModelMock,
		categoryModel: CategoryModelMock,
		securityModel: SecurityModelMock;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootSchedules",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"payeeModel",
					"categoryModel",
					"securityModel",
				]),
		) as Mocha.HookFunction,
	);

	// Inject the object under test and it's remaining dependencies
	beforeEach(
		angular.mock.inject(
			(
				_scheduleModel_: ScheduleModel,
				_$httpBackend_: angular.IHttpBackendService,
				_payeeModel_: PayeeModelMock,
				_categoryModel_: CategoryModelMock,
				_securityModel_: SecurityModelMock,
			): void => {
				scheduleModel = _scheduleModel_;

				$httpBackend = _$httpBackend_;

				payeeModel = _payeeModel_;
				categoryModel = _categoryModel_;
				securityModel = _securityModel_;
			},
		) as Mocha.HookFunction,
	);

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	describe("path", (): void => {
		it("should return the schedules collection path when an id is not provided", (): Chai.Assertion =>
			expect(scheduleModel.path()).to.equal("/schedules"));

		it("should return a specific schedule path when an id is provided", (): Chai.Assertion =>
			expect(scheduleModel.path(123)).to.equal("/schedules/123"));
	});

	describe("parse", (): void => {
		let schedule: ScheduledTransaction;

		beforeEach(
			(): ScheduledTransaction =>
				(schedule = scheduleModel["parse"](
					createScheduledBasicTransaction({
						next_due_date: lightFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
					}),
				)),
		);

		it("should convert the next due date from a string to a date", (): void => {
			expect(schedule.next_due_date).to.be.a("date");
			expect(schedule.next_due_date).to.deep.equal(startOfDay(new Date()));
		});
	});

	describe("stringify", (): void => {
		let schedule: ScheduledTransaction;

		beforeEach(
			(): ScheduledTransaction =>
				(schedule = scheduleModel["stringify"](
					createScheduledBasicTransaction({
						next_due_date: startOfDay(new Date()),
					}),
				)),
		);

		it("should convert the next due date from a date to a string", (): void => {
			expect(schedule.next_due_date).to.be.a("string");
			expect(schedule.next_due_date).to.deep.equal(
				lightFormat(new Date(), "yyyy-MM-dd"),
			);
		});
	});

	describe("all", (): void => {
		const expectedUrl = /schedules/v,
			expectedResponse: string[] = ["schedule 1", "schedule 2"];

		beforeEach((): void => {
			scheduleModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(expectedUrl).respond(200, expectedResponse);
		});

		it("should dispatch a GET request to /schedules", (): void => {
			scheduleModel.all();
			$httpBackend.flush();
		});

		it("should parse each schedule returned", (): void => {
			scheduleModel["parse"] = sinon.stub().returnsArg(0);
			scheduleModel.all();
			$httpBackend.flush();
			expect(scheduleModel["parse"]).to.have.been.calledTwice;
		});

		it("should return a list of all schedules", (): void => {
			scheduleModel
				.all()
				.then(
					(scheduledTransactions: ScheduledTransaction[]): Chai.Assertion =>
						expect(scheduledTransactions).to.deep.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		const expectedResponse = "schedule",
			expectedPostUrl = /schedules$/v,
			expectedPatchUrl = /schedules\/1$/v;

		beforeEach((): void => {
			scheduleModel["stringify"] = sinon.stub().returnsArg(0);
			scheduleModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.whenPOST(expectedPostUrl).respond(200, expectedResponse);
			$httpBackend.whenPATCH(expectedPatchUrl).respond(200, expectedResponse);
		});

		it("should flush the payee cache when the schedule payee is new", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1, payee: "" }));
			expect(payeeModel.flush).to.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the payee cache when the schedule payee is existing", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			expect(payeeModel.flush).to.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the category cache when the schedule category is new", (): void => {
			scheduleModel.save(
				createScheduledBasicTransaction({ id: 1, category: "" }),
			);
			expect(categoryModel.flush).to.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the category cache when the schedule category is existing", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			expect(categoryModel.flush).to.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the category cache when the schedule subcategory is new", (): void => {
			scheduleModel.save(
				createScheduledBasicTransaction({ id: 1, subcategory: "" }),
			);
			expect(categoryModel.flush).to.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the category cache when the schedule subcategory is existing", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			expect(categoryModel.flush).to.not.have.been.called;
			$httpBackend.flush();
		});

		it("should flush the security cache when the schedule security is new", (): void => {
			scheduleModel.save(
				createScheduledSecurityHoldingTransaction({ id: 1, security: "" }),
			);
			expect(securityModel.flush).to.have.been.called;
			$httpBackend.flush();
		});

		it("should not flush the security cache when the schedule security is existing", (): void => {
			scheduleModel.save(createScheduledSecurityHoldingTransaction({ id: 1 }));
			expect(securityModel.flush).to.not.have.been.called;
			$httpBackend.flush();
		});

		it("should stringify the schedule", (): void => {
			const schedule: ScheduledBasicTransaction =
				createScheduledBasicTransaction({ id: 1 });

			scheduleModel.save(schedule);
			expect(scheduleModel["stringify"]).to.have.been.calledWith(schedule);
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /schedules when an id is not provided", (): void => {
			const schedule: ScheduledBasicTransaction =
				createScheduledBasicTransaction();

			schedule.id = null;
			$httpBackend.expectPOST(expectedPostUrl, schedule);
			scheduleModel.save(schedule);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /schedules/{id} when an id is provided", (): void => {
			const schedule: ScheduledBasicTransaction =
				createScheduledBasicTransaction({ id: 1 });

			$httpBackend.expectPATCH(expectedPatchUrl, schedule);
			scheduleModel.save(schedule);
			$httpBackend.flush();
		});

		it("should parse the schedule", (): void => {
			scheduleModel.save(createScheduledBasicTransaction({ id: 1 }));
			$httpBackend.flush();
			expect(scheduleModel["parse"]).to.have.been.calledWith(expectedResponse);
		});

		it("should return the schedule", (): void => {
			scheduleModel
				.save(createScheduledBasicTransaction({ id: 1 }))
				.then(
					(scheduledTransaction: ScheduledTransaction): Chai.Assertion =>
						expect(scheduledTransaction).to.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		it("should dispatch a DELETE request to /schedules/{id}", (): void => {
			$httpBackend.expectDELETE(/schedules\/1$/v).respond(200);
			scheduleModel.destroy(createScheduledBasicTransaction({ id: 1 }));
			$httpBackend.flush();
		});
	});
});
