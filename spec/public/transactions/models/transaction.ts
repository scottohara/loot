import {
	BasicTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	Subtransaction,
	SubtransferTransaction,
	Transaction,
	TransactionBatch,
	TransferrableTransaction
} from "transactions/types";
import {
	createBasicTransaction,
	createSubtransaction,
	createSubtransferTransaction
} from "mocks/transactions/factories";
import {
	lightFormat,
	parseISO,
	startOfDay
} from "date-fns";
import { AccountModelMock } from "mocks/accounts/types";
import { CategoryModelMock } from "mocks/categories/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { Payee } from "payees/types";
import PayeeModel from "payees/models/payee";
import { SecurityModelMock } from "mocks/securities/types";
import TransactionModel from "transactions/models/transaction";
import { WindowMock } from "mocks/node-modules/angular/types";
import angular from "angular";
import createAccount from "mocks/accounts/factories";
import createPayee from "mocks/payees/factories";
import createSecurity from "mocks/securities/factories";
import sinon from "sinon";

describe("transactionModel", (): void => {
	let	transactionModel: TransactionModel,
			$httpBackend: angular.IHttpBackendService,
			$window: WindowMock,
			accountModel: AccountModelMock,
			payeeModel: PayeeModel,
			categoryModel: CategoryModelMock,
			securityModel: SecurityModelMock;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootTransactions", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$window", "accountModel", "payeeModel", "categoryModel", "securityModel"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_transactionModel_: TransactionModel, _$httpBackend_: angular.IHttpBackendService, _$window_: WindowMock, _accountModel_: AccountModelMock, _payeeModel_: PayeeModel, _categoryModel_: CategoryModelMock, _securityModel_: SecurityModelMock): void => {
		transactionModel = _transactionModel_;

		$httpBackend = _$httpBackend_;
		$window = _$window_;

		accountModel = _accountModel_;
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
		it("should return the transactions collection path when an id is not provided", (): Chai.Assertion => transactionModel.path().should.equal("/transactions"));

		it("should return a specific transaction path when an id is provided", (): Chai.Assertion => transactionModel.path(123).should.equal("/transactions/123"));
	});

	describe("fullPath", (): void => {
		it("should return the path including the parent context", (): void => {
			sinon.stub(transactionModel, "path").returns("/path");
			transactionModel.fullPath("/context").should.equal("/context/path");
		});
	});

	describe("parse", (): void => {
		it("should convert the transaction date from a string to a date", (): void => {
			const transaction = transactionModel["parse"](createBasicTransaction({ transaction_date: lightFormat(new Date(), "yyyy-MM-dd HH:mm:ss") }));

			(transaction.transaction_date as Date).should.be.a("date");
			(transaction.transaction_date as Date).should.deep.equal(startOfDay(new Date()));
		});

		it("should do nothing if the transaction date is undefined", (): void => {
			const transaction = transactionModel["parse"](createBasicTransaction({ transaction_date: undefined }));

			(undefined === transaction.transaction_date).should.be.true;
		});
	});

	describe("stringify", (): void => {
		it("should convert the transaction date from a date to a string", (): void => {
			const transaction = transactionModel["stringify"](createBasicTransaction({ transaction_date: startOfDay(new Date()) }));

			(transaction.transaction_date as string).should.be.a("string");
			(transaction.transaction_date as string).should.deep.equal(lightFormat(new Date(), "yyyy-MM-dd"));
		});

		it("should do nothing if the transaction date is undefined", (): void => {
			const transaction = transactionModel["stringify"](createBasicTransaction({ transaction_date: undefined }));

			(undefined === transaction.transaction_date).should.be.true;
		});
	});

	describe("all", (): void => {
		const expectedResponse: TransactionBatch = {
			transactions: [createBasicTransaction(), createBasicTransaction()],
			openingBalance: 0,
			atEnd: false
		};
		let actualResponse: angular.IPromise<TransactionBatch>;

		beforeEach((): void => {
			const fromDate = new Date();

			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(new RegExp(`context/transactions\\?as_at=${fromDate.toISOString()}&direction=prev&unreconciled=true`, "u")).respond(200, expectedResponse);
			actualResponse = transactionModel.all("context", fromDate, "prev", true);
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /{context}/transactions?as_at={fromDate}&direction={direction}&unreconciled={unreconciledOnly}", (): null => null);

		it("should parse each transaction returned", (): Chai.Assertion => transactionModel["parse"].should.have.been.calledTwice);

		it("should return a list of transactions", (): void => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("query", (): void => {
		const expectedResponse: TransactionBatch = {
			transactions: [createBasicTransaction(), createBasicTransaction()],
			openingBalance: 0,
			atEnd: false
		};
		let actualResponse: angular.IPromise<TransactionBatch>;

		beforeEach((): void => {
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/transactions\?direction=prev&query=query/u).respond(200, expectedResponse);
			actualResponse = transactionModel.query("query", null, "prev");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /transactions?as_at={fromDate}&direction={direction}&query={query}", (): null => null);

		it("should parse each transaction returned", (): Chai.Assertion => transactionModel["parse"].should.have.been.calledTwice);

		it("should return a list of transactions", (): void => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("findSubtransactions", (): void => {
		const expectedResponse = "subtransactions";
		let actualResponse: angular.IPromise<SplitTransactionChild[]>;

		beforeEach((): void => {
			$httpBackend.expectGET(/transactions\/123\/subtransactions/u).respond(200, expectedResponse);
			actualResponse = transactionModel.findSubtransactions(123);
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /transactions/123/subtransactions", (): null => null);

		it("should return a list of subtransactions", (): void => {
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("find", (): void => {
		const expectedResponse = "transaction";
		let actualResponse: angular.IPromise<Transaction>;

		beforeEach((): void => {
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/transactions\/123/u).respond(200, expectedResponse);
			actualResponse = transactionModel.find(123);
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /transactions/123", (): null => null);

		it("should parse the transaction", (): Chai.Assertion => transactionModel["parse"].should.have.been.calledWith(expectedResponse));

		it("should return the transaction", (): void => {
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("save", (): void => {
		const expectedResponse = "transaction";
		let transaction: Transaction;

		beforeEach((): void => {
			transactionModel["invalidateCaches"] = sinon.stub();
			transactionModel["stringify"] = sinon.stub().returnsArg(0);
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.whenPOST(/transactions$/u).respond(200, expectedResponse);
			$httpBackend.whenPATCH(/transactions\/1$/u).respond(200, expectedResponse);
			transaction = createBasicTransaction({ id: 1 });
		});

		it("should invalidate the associated $http caches", (): void => {
			transactionModel.save(transaction);
			transactionModel["invalidateCaches"].should.have.been.called;
			$httpBackend.flush();
		});

		it("should stringify the transaction", (): void => {
			transactionModel.save(transaction);
			transactionModel["stringify"].should.have.been.calledWith(transaction);
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /transactions when an id is not provided", (): void => {
			transaction.id = null;
			$httpBackend.expectPOST(/transactions$/u, transaction);
			transactionModel.save(transaction);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /transactions/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(/transactions\/1$/u, transaction);
			transactionModel.save(transaction);
			$httpBackend.flush();
		});

		it("should save the transaction date", (): void => {
			transaction.transaction_date = parseISO("2000-01-01");
			transactionModel.save(transaction);
			$httpBackend.flush();
			(transactionModel.lastTransactionDate as Date).should.deep.equal(transaction.transaction_date);
		});

		it("should parse the transaction", (): void => {
			transactionModel.save(transaction);
			$httpBackend.flush();
			transactionModel["parse"].should.have.been.calledWith(expectedResponse);
		});

		it("should return the transaction", (): void => {
			const actualResponse = transactionModel.save(transaction);

			$httpBackend.flush();
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("destroy", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transactionModel["invalidateCaches"] = sinon.stub();
			$httpBackend.whenDELETE(/transactions\/1$/u).respond(200);
			transaction = createBasicTransaction({ id: 1 });
		});

		it("should invalidate the associated $http caches", (): void => {
			transactionModel.destroy(transaction);
			transactionModel["invalidateCaches"].should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /transactions/{id}", (): void => {
			$httpBackend.expectDELETE(/transactions\/1$/u);
			transactionModel.destroy(transaction);
			$httpBackend.flush();
		});
	});

	describe("invalidateCaches", (): void => {
		const transaction: Transaction = createBasicTransaction() as Transaction;

		beforeEach((): void => {
			(transaction as TransferrableTransaction).account = createAccount();
			(transaction as SecurityTransaction).security = createSecurity();
			(transaction as SplitTransaction).subtransactions = [createSubtransaction(), createSubtransferTransaction()];
			transactionModel["invalidateCache"] = sinon.stub();
			transactionModel["invalidateCaches"](transaction);
		});

		it("should invalidate the primary account from the account cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(accountModel, transaction.primary_account));

		it("should invalidate the payee from the payee cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(payeeModel, (transaction as BasicTransaction).payee));

		it("should invalidate the category from the category cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(categoryModel, transaction.category));

		it("should invalidate the subcategory from the category cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(categoryModel, (transaction as BasicTransaction).subcategory));

		it("should invalidate the account from the account cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(accountModel, (transaction as TransferrableTransaction).account));

		it("should invalidate the security from the security cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(securityModel, (transaction as SecurityTransaction).security));

		it("should invalidate any subtransaction categories from the category cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(categoryModel, (transaction as SplitTransaction).subtransactions[0].category));

		it("should invalidate any subtransaction subcategories from the category cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(categoryModel, ((transaction as SplitTransaction).subtransactions[0] as Subtransaction).subcategory));

		it("should invalidate any subtransfer accounts from the account cache", (): Chai.Assertion => transactionModel["invalidateCache"].should.have.been.calledWith(accountModel, ((transaction as SplitTransaction).subtransactions[1] as SubtransferTransaction).account));
	});

	describe("invalidateCache", (): void => {
		it("should do nothing if the item is an empty string", (): void => {
			transactionModel["invalidateCache"](payeeModel, "");
			payeeModel.flush.should.not.have.been.called;
		});

		it("should flush the $http cache if the item is a non-empty string", (): void => {
			transactionModel["invalidateCache"](payeeModel, "test");
			payeeModel.flush.should.have.been.calledWithExactly();
		});

		it("should do nothing if the item is undefined", (): void => {
			transactionModel["invalidateCache"](payeeModel, {} as Payee);
			payeeModel.flush.should.not.have.been.called;
		});

		it("should do nothing if the item is null", (): void => {
			transactionModel["invalidateCache"](payeeModel, null);
			payeeModel.flush.should.not.have.been.called;
		});

		it("should do nothing if the item has no id", (): void => {
			const payee = createPayee();

			delete payee.id;
			transactionModel["invalidateCache"](payeeModel, payee);
			payeeModel.flush.should.not.have.been.called;
		});

		it("should remove the item from the $http cache when the item has an id", (): void => {
			transactionModel["invalidateCache"](payeeModel, createPayee({ id: 1 }));
			payeeModel.flush.should.have.been.calledWith(1);
		});
	});

	describe("updateStatus", (): void => {
		beforeEach((): void => {
			$httpBackend.whenPATCH(/context\/transactions\/1\/status\?Cleared$/u).respond(200);
			$httpBackend.whenDELETE(/context\/transactions\/1\/status$/u).respond(200);
		});

		it("should dispatch a PATCH request to /{context}/transactions/{id}/status?{status} when a status is provided", (): void => {
			$httpBackend.expectPATCH(/context\/transactions\/1\/status\?Cleared$/u);
			transactionModel.updateStatus("context", 1, "Cleared");
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a blank status is provided", (): void => {
			$httpBackend.expectDELETE(/context\/transactions\/1\/status$/u);
			transactionModel.updateStatus("context", 1, "");
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a null status is provided", (): void => {
			$httpBackend.expectDELETE(/context\/transactions\/1\/status$/u);
			transactionModel.updateStatus("context", 1);
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a status is not provided", (): void => {
			$httpBackend.expectDELETE(/context\/transactions\/1\/status$/u);
			transactionModel.updateStatus("context", 1);
		});

		afterEach((): void => $httpBackend.flush());
	});

	describe("flag", (): void => {
		it("should dispatch a PUT request to /transactions/{id}/flag", (): void => {
			$httpBackend.expectPUT(/transactions\/1\/flag/u, { memo: "flag" }).respond(200);
			transactionModel.flag(createBasicTransaction({ id: 1, flag: "flag" }));
			$httpBackend.flush();
		});
	});

	describe("unflag", (): void => {
		it("should dispatch a DELETE request to /transactions/{id}/flag", (): void => {
			$httpBackend.expectDELETE(/transactions\/1\/flag/u).respond(200);
			transactionModel.unflag(1);
			$httpBackend.flush();
		});
	});

	describe("allDetailsShown", (): void => {
		it("should be true if the show all details setting is not present", (): Chai.Assertion => transactionModel.allDetailsShown().should.be.true);

		it("should be true if the show all details setting is not set to false", (): void => {
			$window.localStorage.getItem.withArgs("lootShowAllTransactionDetails").returns("true");
			transactionModel.allDetailsShown().should.be.true;
		});

		it("should be false if the show all details setting is set to false", (): void => {
			$window.localStorage.getItem.withArgs("lootShowAllTransactionDetails").returns("false");
			transactionModel.allDetailsShown().should.be.false;
		});
	});

	describe("showAllDetails", (): void => {
		it("should save the show all details setting", (): void => {
			transactionModel.showAllDetails(true);
			$window.localStorage.setItem.should.have.been.calledWith("lootShowAllTransactionDetails", "true");
		});
	});

	describe("lastTransactionDate", (): void => {
		it("should return the last used transaction date", (): Chai.Assertion => (transactionModel.lastTransactionDate as Date).should.deep.equal(startOfDay(new Date())));
	});
});
