(function() {
	"use strict";

	/*jshint expr: true */

	describe("transactionModel", function() {
		// The object under test
		var transactionModel;

		// Dependencies
		var $httpBackend,
				$http,
				payeeModel,
				categoryModel,
				securityModel;

		// Load the modules
		beforeEach(module("lootMocks", "transactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["payeeModel", "categoryModel", "securityModel"]);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_transactionModel_, _$httpBackend_, _$http_, _payeeModel_, _categoryModel_, _securityModel_) {
			transactionModel = _transactionModel_;

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
			it("should return the transactions collection path when an id is not provided", function() {
				transactionModel.path().should.equal("/transactions");
			});

			it("should return a specific transaction path when an id is provided", function() {
				transactionModel.path(123).should.equal("/transactions/123");
			});
		});

		describe("fullPath", function() {
			it("should return the path including the parent context", function() {
				transactionModel.path = sinon.stub().returns("/path");
				transactionModel.fullPath("/context").should.equal("/context/path");
			});
		});

		describe("all", function() {
			var expectedResponse = "transactions",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/context\/transactions\?as_at=fromDate&direction=direction&unreconciled=unreconciledOnly/).respond(200, expectedResponse);
				actualResponse = transactionModel.all("context", "fromDate", "direction", "unreconciledOnly");
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /{context}/transactions?as_at={fromDate}&direction={direction}&unreconciled={unreconciledOnly}", function() {
			});
			
			it("should return a list of transactions", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("query", function() {
			var expectedResponse = "transactions",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/transactions\?as_at=fromDate&direction=direction&query=query/).respond(200, expectedResponse);
				actualResponse = transactionModel.query("query", "fromDate", "direction");
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /transactions?as_at={fromDate}&direction={direction}&query={query}", function() {
			});
			
			it("should return a list of transactions", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("findSubtransactions", function() {
			var expectedResponse = "subtransactions",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/transactions\/123\/subtransactions/).respond(200, expectedResponse);
				actualResponse = transactionModel.findSubtransactions(123);
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /transactions/123/subtransactions", function() {
			});
			
			it("should return a list of subtransactions", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("find", function() {
			var expectedResponse = "transaction",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/transactions\/123/).respond(200, expectedResponse);
				actualResponse = transactionModel.find(123);
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /transactions/123", function() {
			});
			
			it("should return the transaction", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("save", function() {
			beforeEach(function() {
				$httpBackend.whenPOST(/transactions$/).respond(200);
				$httpBackend.whenPATCH(/transactions\/123$/).respond(200);
			});

			it("should flush the payee cache when the transaction payee is new", function() {
				transactionModel.save({payee: ""});
				payeeModel.flush.should.have.been.called;
			});

			it("should not flush the payee cache when the transaction payee is existing", function() {
				transactionModel.save({payee: {}});
				payeeModel.flush.should.not.have.been.called;
			});

			it("should flush the category cache when the transaction category is new", function() {
				transactionModel.save({category: ""});
				categoryModel.flush.should.have.been.called;
			});

			it("should not flush the category cache when the transaction category is existing", function() {
				transactionModel.save({category: {}});
				categoryModel.flush.should.not.have.been.called;
			});

			it("should flush the category cache when the transaction subcategory is new", function() {
				transactionModel.save({subcategory: ""});
				categoryModel.flush.should.have.been.called;
			});

			it("should not flush the category cache when the transaction subcategory is existing", function() {
				transactionModel.save({subcategory: {}});
				categoryModel.flush.should.not.have.been.called;
			});

			it("should flush the security cache when the transaction security is new", function() {
				transactionModel.save({security: ""});
				securityModel.flush.should.have.been.called;
			});

			it("should not flush the security cache when the transaction security is existing", function() {
				transactionModel.save({security: {}});
				securityModel.flush.should.not.have.been.called;
			});

			it("should dispatch a POST request to /transactions when an id is not provided", function() {
				$httpBackend.expectPOST(/transactions$/, {});
				transactionModel.save({});
			});

			it("should dispatch a PATCH request to /transactions/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/transactions\/123$/, {id: 123});
				transactionModel.save({id: 123});
			});

			afterEach(function() {
				$httpBackend.flush();
			});
		});

		describe("destroy", function() {
			it("should dispatch a DELETE request to /transactions/{id}", function() {
				$httpBackend.expectDELETE(/transactions\/123$/).respond(200);
				transactionModel.destroy({id: 123});
				$httpBackend.flush();
			});
		});

		describe("updateStatus", function() {
			beforeEach(function() {
				$httpBackend.whenPATCH(/context\/transactions\/123\/status\?status$/).respond(200);
				$httpBackend.whenDELETE(/context\/transactions\/123\/status$/).respond(200);
			});

			it("should dispatch a PATCH request to /{context}/transactions/{id}/status?{status} when a status is provided", function() {
				$httpBackend.expectPATCH(/context\/transactions\/123\/status\?status$/);
				transactionModel.updateStatus("context", 123, "status");
			});

			it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a status is not provided", function() {
				$httpBackend.expectDELETE(/context\/transactions\/123\/status$/);
				transactionModel.updateStatus("context", 123);
			});

			afterEach(function() {
				$httpBackend.flush();
			});
		});

		describe("flag", function() {
			it("should dispatch a PUT request to /transactions/{id}/flag", function() {
				$httpBackend.expectPUT(/transactions\/123\/flag/, {memo: "flag"}).respond(200);
				transactionModel.flag({id: 123, flag: "flag"});
				$httpBackend.flush();
			});
		});

		describe("unflag", function() {
			it("should dispatch a DELETE request to /transactions/{id}/flag", function() {
				$httpBackend.expectDELETE(/transactions\/123\/flag/).respond(200);
				transactionModel.unflag(123);
				$httpBackend.flush();
			});
		});
	});
})();
