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

		describe("all", function() {
			var expectedResponse = "schedules",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/schedules/).respond(200, expectedResponse);
				actualResponse = scheduleModel.all();
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /schedules", function() {
			});
			
			it("should return a list of all schedules", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("save", function() {
			beforeEach(function() {
				$httpBackend.whenPOST(/schedules$/).respond(200);
				$httpBackend.whenPATCH(/schedules\/123$/).respond(200);
			});

			it("should flush the payee cache when the schedule payee is new", function() {
				scheduleModel.save({payee: ""});
				payeeModel.flush.should.have.been.called;
			});

			it("should not flush the payee cache when the schedule payee is existing", function() {
				scheduleModel.save({payee: {}});
				payeeModel.flush.should.not.have.been.called;
			});

			it("should flush the category cache when the schedule category is new", function() {
				scheduleModel.save({category: ""});
				categoryModel.flush.should.have.been.called;
			});

			it("should not flush the category cache when the schedule category is existing", function() {
				scheduleModel.save({category: {}});
				categoryModel.flush.should.not.have.been.called;
			});

			it("should flush the category cache when the schedule subcategory is new", function() {
				scheduleModel.save({subcategory: ""});
				categoryModel.flush.should.have.been.called;
			});

			it("should not flush the category cache when the schedule subcategory is existing", function() {
				scheduleModel.save({subcategory: {}});
				categoryModel.flush.should.not.have.been.called;
			});

			it("should flush the security cache when the schedule security is new", function() {
				scheduleModel.save({security: ""});
				securityModel.flush.should.have.been.called;
			});

			it("should not flush the security cache when the schedule security is existing", function() {
				scheduleModel.save({security: {}});
				securityModel.flush.should.not.have.been.called;
			});

			it("should dispatch a POST request to /schedules when an id is not provided", function() {
				$httpBackend.expectPOST(/schedules$/, {});
				scheduleModel.save({});
			});

			it("should dispatch a PATCH request to /schedules/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/schedules\/123$/, {id: 123});
				scheduleModel.save({id: 123});
			});

			afterEach(function() {
				$httpBackend.flush();
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
