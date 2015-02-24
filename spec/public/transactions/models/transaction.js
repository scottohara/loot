(function() {
	"use strict";

	/*jshint expr: true */

	describe("transactionModel", function() {
		// The object under test
		var transactionModel;

		// Dependencies
		var $httpBackend,
				$http,
				accountModel,
				payeeModel,
				categoryModel,
				securityModel;

		// Load the modules
		beforeEach(module("lootMocks", "lootTransactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["accountModel", "payeeModel", "categoryModel", "securityModel"]);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_transactionModel_, _$httpBackend_, _$http_, _accountModel_, _payeeModel_, _categoryModel_, _securityModel_) {
			transactionModel = _transactionModel_;

			$httpBackend = _$httpBackend_;
			$http = _$http_;

			accountModel = _accountModel_;
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

		describe("parse", function() {
			var	transaction;

			beforeEach(function() {
				transaction = transactionModel.parse({transaction_date: moment().format("YYYY-MM-DD HH:MM:SS")});
			});

			it("should convert the transaction date from a string to a date", function() {
				transaction.transaction_date.should.be.a.Date;
				transaction.transaction_date.should.deep.equal(moment().startOf("day").toDate());
			});
		});

		describe("stringify", function() {
			var	transaction;

			beforeEach(function() {
				transaction = transactionModel.stringify({transaction_date: moment().startOf("day").toDate()});
			});

			it("should convert the transaction date from a date to a string", function() {
				transaction.transaction_date.should.be.a.String;
				transaction.transaction_date.should.deep.equal(moment().format("YYYY-MM-DD"));
			});
		});

		describe("all", function() {
			var expectedResponse = {transactions: ["transaction 1", "transaction 2"]},
					actualResponse;

			beforeEach(function() {
				transactionModel.parse = sinon.stub().returnsArg(0);
				$httpBackend.expectGET(/context\/transactions\?as_at=fromDate&direction=direction&unreconciled=unreconciledOnly/).respond(200, expectedResponse);
				actualResponse = transactionModel.all("context", "fromDate", "direction", "unreconciledOnly");
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /{context}/transactions?as_at={fromDate}&direction={direction}&unreconciled={unreconciledOnly}", function() {
			});
			
			it("should parse each transaction returned", function() {
				transactionModel.parse.should.have.been.calledTwice;
			});

			it("should return a list of transactions", function() {
				actualResponse.should.eventually.deep.equal(expectedResponse);
			});
		});

		describe("query", function() {
			var expectedResponse = {transactions: ["transaction 1", "transaction 2"]},
					actualResponse;

			beforeEach(function() {
				transactionModel.parse = sinon.stub().returnsArg(0);
				$httpBackend.expectGET(/transactions\?as_at=fromDate&direction=direction&query=query/).respond(200, expectedResponse);
				actualResponse = transactionModel.query("query", "fromDate", "direction");
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /transactions?as_at={fromDate}&direction={direction}&query={query}", function() {
			});
			
			it("should parse each transaction returned", function() {
				transactionModel.parse.should.have.been.calledTwice;
			});

			it("should return a list of transactions", function() {
				actualResponse.should.eventually.deep.equal(expectedResponse);
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
				transactionModel.parse = sinon.stub().returnsArg(0);
				$httpBackend.expectGET(/transactions\/123/).respond(200, expectedResponse);
				actualResponse = transactionModel.find(123);
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /transactions/123", function() {
			});
			
			it("should parse the transaction", function() {
				transactionModel.parse.should.have.been.calledWith(expectedResponse);
			});

			it("should return the transaction", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("save", function() {
			var expectedResponse = "transaction";

			beforeEach(function() {
				transactionModel.invalidateCaches = sinon.stub();
				transactionModel.stringify = sinon.stub().returnsArg(0);
				transactionModel.parse = sinon.stub().returnsArg(0);
				$httpBackend.whenPOST(/transactions$/).respond(200, expectedResponse);
				$httpBackend.whenPATCH(/transactions\/123$/).respond(200, expectedResponse);
			});

			it("should invalidate the associated $http caches", function() {
				transactionModel.save({});
				transactionModel.invalidateCaches.should.have.been.called;
				$httpBackend.flush();
			});

			it("should stringify the transaction", function() {
				var transaction = {};
				transactionModel.save(transaction);
				transactionModel.stringify.should.have.been.calledWith(transaction);
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /transactions when an id is not provided", function() {
				$httpBackend.expectPOST(/transactions$/, {});
				transactionModel.save({});
				$httpBackend.flush();
			});

			it("should dispatch a PATCH request to /transactions/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/transactions\/123$/, {id: 123});
				transactionModel.save({id: 123});
				$httpBackend.flush();
			});

			it("should parse the transaction", function() {
				transactionModel.save({});
				$httpBackend.flush();
				transactionModel.parse.should.have.been.calledWith(expectedResponse);
			});

			it("should return the transaction", function() {
				var actualResponse = transactionModel.save({});
				$httpBackend.flush();
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("destroy", function() {
			beforeEach(function() {
				transactionModel.invalidateCaches = sinon.stub();
				$httpBackend.whenDELETE(/transactions\/123$/).respond(200);
			});

			it("should invalidate the associated $http caches", function() {
				transactionModel.destroy({id: 123});
				transactionModel.invalidateCaches.should.have.been.called;
				$httpBackend.flush();
			});

			it("should dispatch a DELETE request to /transactions/{id}", function() {
				$httpBackend.expectDELETE(/transactions\/123$/);
				transactionModel.destroy({id: 123});
				$httpBackend.flush();
			});
		});

		describe("invalidateCaches", function() {
			var transaction;

			beforeEach(function() {
				transaction = {
					primary_account: "primary_account",
					payee: "payee",
					category: "category",
					subcategory: "subcategory",
					account: "account",
					security: "security",
					subtransactions: [
						{
							category: "subtransaction category",
							subcategory: "subtransaction subcategory",
							account: "subtransfer account"
						}
					]
				};
				transactionModel.invalidateCache = sinon.stub();
				transactionModel.invalidateCaches(transaction);
			});

			it("should invalidate the primary account from the account cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(accountModel, "primary_account");
			});

			it("should invalidate the payee from the payee cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(payeeModel, "payee");
			});

			it("should invalidate the category from the category cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "category");
			});

			it("should invalidate the subcategory from the category cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "subcategory");
			});

			it("should invalidate the account from the account cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(accountModel, "account");
			});

			it("should invalidate the security from the security cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(securityModel, "security");
			});

			it("should invalidate any subtransaction categories from the category cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "subtransaction category");
			});

			it("should invalidate any subtransaction subcategories from the category cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "subtransaction subcategory");
			});

			it("should invalidate any subtransfer accounts from the account cache", function() {
				transactionModel.invalidateCache.should.have.been.calledWith(accountModel, "subtransfer account");
			});
		});

		describe("invalidateCache", function() {
			it("should do nothing if the item is an empty string", function() {
				transactionModel.invalidateCache(payeeModel, "");
				payeeModel.flush.should.not.have.been.called;
			});

			it("should flush the $http cache if the item is a non-empty string", function() {
				transactionModel.invalidateCache(payeeModel, "test");
				payeeModel.flush.should.have.been.calledWith(undefined);
			});

			it("should do nothing if the item is undefined", function() {
				transactionModel.invalidateCache(payeeModel, undefined);
				payeeModel.flush.should.not.have.been.called;
			});

			it("should do nothing if the item is null", function() {
				transactionModel.invalidateCache(payeeModel, null);
				payeeModel.flush.should.not.have.been.called;
			});

			it("should do nothing if the item has no id", function() {
				transactionModel.invalidateCache(payeeModel, {});
				payeeModel.flush.should.not.have.been.called;
			});

			it("should remove the item from the $http cache when the item has an id", function() {
				transactionModel.invalidateCache(payeeModel, {id: 123});
				payeeModel.flush.should.have.been.calledWith(123);
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
