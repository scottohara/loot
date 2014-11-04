(function() {
	"use strict";

	/*jshint expr: true */

	describe("scheduleModel", function() {
		// The object under test
		var scheduleModel;

		// Dependencies
		var $httpBackend,
				$http,
				payeeModel,
				categoryModel,
				securityModel;

		// Load the modules
		beforeEach(module("lootMocks", "schedules", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["payeeModel", "categoryModel", "securityModel"]);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_scheduleModel_, _$httpBackend_, _$http_, _payeeModel_, _categoryModel_, _securityModel_) {
			scheduleModel = _scheduleModel_;

			$httpBackend = _$httpBackend_;
			$http = _$http_;

			payeeModel = _payeeModel_;
			categoryModel = _categoryModel_;
			securityModel = _securityModel_;
		}));

		// After each spec, verify that there are no outstanding http expectations or requests
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		describe("path", function() {
			it("should return the schedules collection path when an id is not provided", function() {
				scheduleModel.path().should.equal("/schedules");
			});

			it("should return a specific schedule path when an id is provided", function() {
				scheduleModel.path(123).should.equal("/schedules/123");
			});
		});

		describe("parse", function() {
			var	schedule;

			beforeEach(function() {
				schedule = scheduleModel.parse({next_due_date: moment().format("YYYY-MM-DD HH:MM:SS")});
			});

			it("should convert the next due date from a string to a date", function() {
				schedule.next_due_date.should.be.a.Date;
				schedule.next_due_date.should.deep.equal(moment().startOf("day").toDate());
			});
		});

		describe("stringify", function() {
			var	schedule;

			beforeEach(function() {
				schedule = scheduleModel.stringify({next_due_date: moment().startOf("day").toDate()});
			});

			it("should convert the next due date from a date to a string", function() {
				schedule.next_due_date.should.be.a.String;
				schedule.next_due_date.should.deep.equal(moment().format("YYYY-MM-DD"));
			});
		});

		describe("all", function() {
			var expectedResponse = ["schedule 1", "schedule 2"],
					actualResponse;

			beforeEach(function() {
				scheduleModel.parse = sinon.stub().returnsArg(0);
				$httpBackend.expectGET(/schedules/).respond(200, expectedResponse);
				actualResponse = scheduleModel.all();
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /schedules", function() {
			});
			
			it("should parse each schedule returned", function() {
				scheduleModel.parse.should.have.been.calledTwice;
			});

			it("should return a list of all schedules", function() {
				actualResponse.should.eventually.deep.equal(expectedResponse);
			});
		});

		describe("save", function() {
			var expectedResponse = "schedule";

			beforeEach(function() {
				scheduleModel.stringify = sinon.stub().returnsArg(0);
				scheduleModel.parse = sinon.stub().returnsArg(0);
				$httpBackend.whenPOST(/schedules$/).respond(200, expectedResponse);
				$httpBackend.whenPATCH(/schedules\/123$/).respond(200, expectedResponse);
			});

			it("should flush the payee cache when the schedule payee is new", function() {
				scheduleModel.save({payee: ""});
				payeeModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should not flush the payee cache when the schedule payee is existing", function() {
				scheduleModel.save({payee: {}});
				payeeModel.flush.should.not.have.been.called;
				$httpBackend.flush();
			});

			it("should flush the category cache when the schedule category is new", function() {
				scheduleModel.save({category: ""});
				categoryModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should not flush the category cache when the schedule category is existing", function() {
				scheduleModel.save({category: {}});
				categoryModel.flush.should.not.have.been.called;
				$httpBackend.flush();
			});

			it("should flush the category cache when the schedule subcategory is new", function() {
				scheduleModel.save({subcategory: ""});
				categoryModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should not flush the category cache when the schedule subcategory is existing", function() {
				scheduleModel.save({subcategory: {}});
				categoryModel.flush.should.not.have.been.called;
				$httpBackend.flush();
			});

			it("should flush the security cache when the schedule security is new", function() {
				scheduleModel.save({security: ""});
				securityModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should not flush the security cache when the schedule security is existing", function() {
				scheduleModel.save({security: {}});
				securityModel.flush.should.not.have.been.called;
				$httpBackend.flush();
			});

			it("should stringify the schedule", function() {
				var schedule = {};
				scheduleModel.save(schedule);
				scheduleModel.stringify.should.have.been.calledWith(schedule);
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /schedules when an id is not provided", function() {
				$httpBackend.expectPOST(/schedules$/, {});
				scheduleModel.save({});
				$httpBackend.flush();
			});

			it("should dispatch a PATCH request to /schedules/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/schedules\/123$/, {id: 123});
				scheduleModel.save({id: 123});
				$httpBackend.flush();
			});

			it("should parse the schedule", function() {
				scheduleModel.save({});
				$httpBackend.flush();
				scheduleModel.parse.should.have.been.calledWith(expectedResponse);
			});

			it("should return the schedule", function() {
				var actualResponse = scheduleModel.save({});
				$httpBackend.flush();
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("destroy", function() {
			it("should dispatch a DELETE request to /schedules/{id}", function() {
				$httpBackend.expectDELETE(/schedules\/123$/).respond(200);
				scheduleModel.destroy({id: 123});
				$httpBackend.flush();
			});
		});
	});
})();
