import type {
	BasicTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	Subtransaction,
	SubtransferTransaction,
	Transaction,
	TransactionBatch,
	TransferrableTransaction,
} from "~/transactions/types";
import {
	createBasicTransaction,
	createSubtransaction,
	createSubtransferTransaction,
} from "~/mocks/transactions/factories";
import { lightFormat, parseISO, startOfDay } from "date-fns";
import type { AccountModelMock } from "~/mocks/accounts/types";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Payee } from "~/payees/types";
import type PayeeModel from "~/payees/models/payee";
import type { SecurityModelMock } from "~/mocks/securities/types";
import type TransactionModel from "~/transactions/models/transaction";
import type { WindowMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";
import createPayee from "~/mocks/payees/factories";
import createSecurity from "~/mocks/securities/factories";
import sinon from "sinon";

describe("transactionModel", (): void => {
	let transactionModel: TransactionModel,
		$httpBackend: angular.IHttpBackendService,
		$window: WindowMock,
		accountModel: AccountModelMock,
		payeeModel: PayeeModel,
		categoryModel: CategoryModelMock,
		securityModel: SecurityModelMock;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootTransactions",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$window",
					"accountModel",
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
				_transactionModel_: TransactionModel,
				_$httpBackend_: angular.IHttpBackendService,
				_$window_: WindowMock,
				_accountModel_: AccountModelMock,
				_payeeModel_: PayeeModel,
				_categoryModel_: CategoryModelMock,
				_securityModel_: SecurityModelMock,
			): void => {
				transactionModel = _transactionModel_;

				$httpBackend = _$httpBackend_;
				$window = _$window_;

				accountModel = _accountModel_;
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
		it("should return the transactions collection path when an id is not provided", (): Chai.Assertion =>
			expect(transactionModel.path()).to.equal("/transactions"));

		it("should return a specific transaction path when an id is provided", (): Chai.Assertion =>
			expect(transactionModel.path(123)).to.equal("/transactions/123"));
	});

	describe("fullPath", (): void => {
		it("should return the path including the parent context", (): void => {
			sinon.stub(transactionModel, "path").returns("/path");
			expect(transactionModel.fullPath("/context")).to.equal("/context/path");
		});
	});

	describe("parse", (): void => {
		it("should convert the transaction date from a string to a date", (): void => {
			const transaction = transactionModel["parse"](
				createBasicTransaction({
					transaction_date: lightFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
				}),
			);

			expect(transaction.transaction_date as Date).to.be.a("date");
			expect(transaction.transaction_date as Date).to.deep.equal(
				startOfDay(new Date()),
			);
		});

		it("should do nothing if the transaction date is undefined", (): void => {
			const transaction = transactionModel["parse"](
				createBasicTransaction({ transaction_date: undefined }),
			);

			expect(transaction.transaction_date).to.be.undefined;
		});
	});

	describe("stringify", (): void => {
		it("should convert the transaction date from a date to a string", (): void => {
			const transaction = transactionModel["stringify"](
				createBasicTransaction({ transaction_date: startOfDay(new Date()) }),
			);

			expect(transaction.transaction_date as string).to.be.a("string");
			expect(transaction.transaction_date as string).to.deep.equal(
				lightFormat(new Date(), "yyyy-MM-dd"),
			);
		});

		it("should do nothing if the transaction date is undefined", (): void => {
			const transaction = transactionModel["stringify"](
				createBasicTransaction({ transaction_date: undefined }),
			);

			expect(transaction.transaction_date).to.be.undefined;
		});
	});

	describe("all", (): void => {
		const expectedResponse: TransactionBatch = {
			transactions: [createBasicTransaction(), createBasicTransaction()],
			openingBalance: 0,
			atEnd: false,
		};
		let fromDate: Date;

		beforeEach((): void => {
			fromDate = new Date();
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend
				.expectGET(
					new RegExp(
						`context/transactions\\?as_at=${fromDate.toISOString()}&direction=prev&unreconciled=true`,
						"v",
					),
				)
				.respond(200, expectedResponse);
		});

		it("should dispatch a GET request to /{context}/transactions?as_at={fromDate}&direction={direction}&unreconciled={unreconciledOnly}", (): void => {
			transactionModel.all("context", fromDate, "prev", true);
			$httpBackend.flush();
		});

		it("should parse each transaction returned", (): void => {
			transactionModel.all("context", fromDate, "prev", true);
			$httpBackend.flush();
			expect(transactionModel["parse"]).to.have.been.calledTwice;
		});

		it("should return a list of transactions", (): void => {
			transactionModel
				.all("context", fromDate, "prev", true)
				.then(
					(transactionBatch: TransactionBatch): Chai.Assertion =>
						expect(transactionBatch).to.deep.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("query", (): void => {
		const expectedResponse: TransactionBatch = {
			transactions: [createBasicTransaction(), createBasicTransaction()],
			openingBalance: 0,
			atEnd: false,
		};

		beforeEach((): void => {
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend
				.expectGET(/transactions\?direction=prev&query=query/v)
				.respond(200, expectedResponse);
		});

		it("should dispatch a GET request to /transactions?direction={direction}&query={query}", (): void => {
			transactionModel.query("query", null, "prev");
			$httpBackend.flush();
		});

		it("should parse each transaction returned", (): void => {
			transactionModel.query("query", null, "prev");
			$httpBackend.flush();
			expect(transactionModel["parse"]).to.have.been.calledTwice;
		});

		it("should return a list of transactions", (): void => {
			transactionModel
				.query("query", null, "prev")
				.then(
					(transactionBatch: TransactionBatch): Chai.Assertion =>
						expect(transactionBatch).to.deep.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("findSubtransactions", (): void => {
		const expectedResponse = "subtransactions";

		beforeEach(
			(): angular.mock.IRequestHandler =>
				$httpBackend
					.expectGET(/transactions\/123\/subtransactions/v)
					.respond(200, expectedResponse),
		);

		it("should dispatch a GET request to /transactions/123/subtransactions", (): void => {
			transactionModel.findSubtransactions(123);
			$httpBackend.flush();
		});

		it("should return a list of subtransactions", (): void => {
			transactionModel
				.findSubtransactions(123)
				.then(
					(subtransactions: SplitTransactionChild[]): Chai.Assertion =>
						expect(subtransactions).to.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("find", (): void => {
		const expectedResponse = "transaction";

		beforeEach((): void => {
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend
				.expectGET(/transactions\/123/v)
				.respond(200, expectedResponse);
		});

		it("should dispatch a GET request to /transactions/123", (): void => {
			transactionModel.find(123);
			$httpBackend.flush();
		});

		it("should parse the transaction", (): void => {
			transactionModel.find(123);
			$httpBackend.flush();
			expect(transactionModel["parse"]).to.have.been.calledWith(
				expectedResponse,
			);
		});

		it("should return the transaction", (): void => {
			transactionModel
				.find(123)
				.then(
					(transaction: Transaction): Chai.Assertion =>
						expect(transaction).to.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		const expectedResponse = "transaction",
			expectedPostUrl = /transactions$/v,
			expectedPatchUrl = /transactions\/1$/v;
		let transaction: Transaction;

		beforeEach((): void => {
			transactionModel["invalidateCaches"] = sinon.stub();
			transactionModel["stringify"] = sinon.stub().returnsArg(0);
			transactionModel["parse"] = sinon.stub().returnsArg(0);
			$httpBackend.whenPOST(expectedPostUrl).respond(200, expectedResponse);
			$httpBackend.whenPATCH(expectedPatchUrl).respond(200, expectedResponse);
			transaction = createBasicTransaction({ id: 1 });
		});

		it("should invalidate the associated $http caches", (): void => {
			transactionModel.save(transaction);
			expect(transactionModel["invalidateCaches"]).to.have.been.called;
			$httpBackend.flush();
		});

		it("should stringify the transaction", (): void => {
			transactionModel.save(transaction);
			expect(transactionModel["stringify"]).to.have.been.calledWith(
				transaction,
			);
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /transactions when an id is not provided", (): void => {
			transaction.id = null;
			$httpBackend.expectPOST(expectedPostUrl, transaction);
			transactionModel.save(transaction);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /transactions/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl, transaction);
			transactionModel.save(transaction);
			$httpBackend.flush();
		});

		it("should save the transaction date", (): void => {
			transaction.transaction_date = parseISO("2000-01-01");
			transactionModel.save(transaction);
			$httpBackend.flush();
			expect(transactionModel.lastTransactionDate as Date).to.deep.equal(
				transaction.transaction_date,
			);
		});

		it("should parse the transaction", (): void => {
			transactionModel.save(transaction);
			$httpBackend.flush();
			expect(transactionModel["parse"]).to.have.been.calledWith(
				expectedResponse,
			);
		});

		it("should return the transaction", (): void => {
			transactionModel
				.save(transaction)
				.then(
					(savedTransaction: Transaction): Chai.Assertion =>
						expect(savedTransaction).to.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		const expectedUrl = /transactions\/1$/v;
		let transaction: Transaction;

		beforeEach((): void => {
			transactionModel["invalidateCaches"] = sinon.stub();
			$httpBackend.whenDELETE(expectedUrl).respond(200);
			transaction = createBasicTransaction({ id: 1 });
		});

		it("should invalidate the associated $http caches", (): void => {
			transactionModel.destroy(transaction);
			expect(transactionModel["invalidateCaches"]).to.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /transactions/{id}", (): void => {
			$httpBackend.expectDELETE(expectedUrl);
			transactionModel.destroy(transaction);
			$httpBackend.flush();
		});
	});

	describe("invalidateCaches", (): void => {
		const transaction: Transaction = createBasicTransaction() as Transaction;

		beforeEach((): void => {
			(transaction as TransferrableTransaction).account = createAccount();
			(transaction as SecurityTransaction).security = createSecurity();
			(transaction as SplitTransaction).subtransactions = [
				createSubtransaction(),
				createSubtransferTransaction(),
			];
			transactionModel["invalidateCache"] = sinon.stub();
			transactionModel["invalidateCaches"](transaction);
		});

		it("should invalidate the primary account from the account cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				accountModel,
				transaction.primary_account,
			));

		it("should invalidate the payee from the payee cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				payeeModel,
				(transaction as BasicTransaction).payee,
			));

		it("should invalidate the category from the category cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				categoryModel,
				transaction.category,
			));

		it("should invalidate the subcategory from the category cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				categoryModel,
				(transaction as BasicTransaction).subcategory,
			));

		it("should invalidate the account from the account cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				accountModel,
				(transaction as TransferrableTransaction).account,
			));

		it("should invalidate the security from the security cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				securityModel,
				(transaction as SecurityTransaction).security,
			));

		it("should invalidate any subtransaction categories from the category cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				categoryModel,
				(transaction as SplitTransaction).subtransactions[0].category,
			));

		it("should invalidate any subtransaction subcategories from the category cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				categoryModel,
				((transaction as SplitTransaction).subtransactions[0] as Subtransaction)
					.subcategory,
			));

		it("should invalidate any subtransfer accounts from the account cache", (): Chai.Assertion =>
			expect(transactionModel["invalidateCache"]).to.have.been.calledWith(
				accountModel,
				(
					(transaction as SplitTransaction)
						.subtransactions[1] as SubtransferTransaction
				).account,
			));
	});

	describe("invalidateCache", (): void => {
		it("should do nothing if the item is an empty string", (): void => {
			transactionModel["invalidateCache"](payeeModel, "");
			expect(payeeModel["flush"]).to.not.have.been.called;
		});

		it("should flush the $http cache if the item is a non-empty string", (): void => {
			transactionModel["invalidateCache"](payeeModel, "test");
			expect(payeeModel["flush"]).to.have.been.calledWithExactly();
		});

		it("should do nothing if the item is undefined", (): void => {
			transactionModel["invalidateCache"](payeeModel, {} as Payee);
			expect(payeeModel["flush"]).to.not.have.been.called;
		});

		it("should do nothing if the item is null", (): void => {
			transactionModel["invalidateCache"](payeeModel, null);
			expect(payeeModel["flush"]).to.not.have.been.called;
		});

		it("should do nothing if the item has no id", (): void => {
			const payee = createPayee();

			delete payee.id;
			transactionModel["invalidateCache"](payeeModel, payee);
			expect(payeeModel["flush"]).to.not.have.been.called;
		});

		it("should remove the item from the $http cache when the item has an id", (): void => {
			transactionModel["invalidateCache"](payeeModel, createPayee({ id: 1 }));
			expect(payeeModel["flush"]).to.have.been.calledWith(1);
		});
	});

	describe("updateStatus", (): void => {
		const expectedPatchUrl = /context\/transactions\/1\/status\?Cleared$/v,
			expectedDeleteUrl = /context\/transactions\/1\/status$/v;

		beforeEach((): void => {
			$httpBackend.whenPATCH(expectedPatchUrl).respond(200);
			$httpBackend.whenDELETE(expectedDeleteUrl).respond(200);
		});

		it("should dispatch a PATCH request to /{context}/transactions/{id}/status?{status} when a status is provided", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl);
			transactionModel.updateStatus("context", 1, "Cleared");
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a blank status is provided", (): void => {
			$httpBackend.expectDELETE(expectedDeleteUrl);
			transactionModel.updateStatus("context", 1, "");
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a null status is provided", (): void => {
			$httpBackend.expectDELETE(expectedDeleteUrl);
			transactionModel.updateStatus("context", 1);
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a status is not provided", (): void => {
			$httpBackend.expectDELETE(expectedDeleteUrl);
			transactionModel.updateStatus("context", 1);
		});

		afterEach((): void => $httpBackend.flush());
	});

	describe("flag", (): void => {
		it("should dispatch a PUT request to /transactions/{id}/flag", (): void => {
			$httpBackend
				.expectPUT(/transactions\/1\/flag/v, {
					flag_type: "noreceipt",
					memo: "flag",
				})
				.respond(200);
			transactionModel.flag(
				createBasicTransaction({ id: 1, flag_type: "noreceipt", flag: "flag" }),
			);
			$httpBackend.flush();
		});
	});

	describe("unflag", (): void => {
		it("should dispatch a DELETE request to /transactions/{id}/flag", (): void => {
			$httpBackend.expectDELETE(/transactions\/1\/flag/v).respond(200);
			transactionModel.unflag(1);
			$httpBackend.flush();
		});
	});

	describe("allDetailsShown", (): void => {
		it("should be true if the show all details setting is not present", (): Chai.Assertion =>
			expect(transactionModel.allDetailsShown()).to.be.true);

		it("should be true if the show all details setting is not set to false", (): void => {
			$window.localStorage.getItem
				.withArgs("lootShowAllTransactionDetails")
				.returns("true");
			expect(transactionModel.allDetailsShown()).to.be.true;
		});

		it("should be false if the show all details setting is set to false", (): void => {
			$window.localStorage.getItem
				.withArgs("lootShowAllTransactionDetails")
				.returns("false");
			expect(transactionModel.allDetailsShown()).to.be.false;
		});
	});

	describe("showAllDetails", (): void => {
		it("should save the show all details setting", (): void => {
			transactionModel.showAllDetails(true);
			expect($window.localStorage.setItem).to.have.been.calledWith(
				"lootShowAllTransactionDetails",
				"true",
			);
		});
	});

	describe("lastTransactionDate", (): void => {
		it("should return the last used transaction date", (): Chai.Assertion =>
			expect(transactionModel.lastTransactionDate as Date).to.deep.equal(
				startOfDay(new Date()),
			));
	});
});
