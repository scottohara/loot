describe("transactionModel", () => {
	let	transactionModel,
			$httpBackend,
			$window,
			accountModel,
			payeeModel,
			categoryModel,
			securityModel;

	// Load the modules
	beforeEach(module("lootMocks", "lootTransactions", mockDependenciesProvider => mockDependenciesProvider.load(["$window", "accountModel", "payeeModel", "categoryModel", "securityModel"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_transactionModel_, _$httpBackend_, _$window_, _accountModel_, _payeeModel_, _categoryModel_, _securityModel_) => {
		transactionModel = _transactionModel_;

		$httpBackend = _$httpBackend_;
		$window = _$window_;

		accountModel = _accountModel_;
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
		it("should return the transactions collection path when an id is not provided", () => transactionModel.path().should.equal("/transactions"));

		it("should return a specific transaction path when an id is provided", () => transactionModel.path(123).should.equal("/transactions/123"));
	});

	describe("fullPath", () => {
		it("should return the path including the parent context", () => {
			transactionModel.path = sinon.stub().returns("/path");
			transactionModel.fullPath("/context").should.equal("/context/path");
		});
	});

	describe("parse", () => {
		let transaction;

		beforeEach(() => transaction = transactionModel.parse({transaction_date: moment().format("YYYY-MM-DD HH:MM:SS")}));

		it("should convert the transaction date from a string to a date", () => {
			transaction.transaction_date.should.be.a.Date;
			transaction.transaction_date.should.deep.equal(moment().startOf("day").toDate());
		});
	});

	describe("stringify", () => {
		let transaction;

		beforeEach(() => transaction = transactionModel.stringify({transaction_date: moment().startOf("day").toDate()}));

		it("should convert the transaction date from a date to a string", () => {
			transaction.transaction_date.should.be.a.String;
			transaction.transaction_date.should.deep.equal(moment().format("YYYY-MM-DD"));
		});
	});

	describe("all", () => {
		const expectedResponse = {transactions: ["transaction 1", "transaction 2"]};
		let actualResponse;

		beforeEach(() => {
			transactionModel.parse = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/context\/transactions\?as_at=fromDate&direction=direction&unreconciled=unreconciledOnly/).respond(200, expectedResponse);
			actualResponse = transactionModel.all("context", "fromDate", "direction", "unreconciledOnly");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /{context}/transactions?as_at={fromDate}&direction={direction}&unreconciled={unreconciledOnly}", () => {});

		it("should parse each transaction returned", () => transactionModel.parse.should.have.been.calledTwice);

		it("should return a list of transactions", () => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("query", () => {
		const expectedResponse = {transactions: ["transaction 1", "transaction 2"]};
		let actualResponse;

		beforeEach(() => {
			transactionModel.parse = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/transactions\?as_at=fromDate&direction=direction&query=query/).respond(200, expectedResponse);
			actualResponse = transactionModel.query("query", "fromDate", "direction");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /transactions?as_at={fromDate}&direction={direction}&query={query}", () => {});

		it("should parse each transaction returned", () => transactionModel.parse.should.have.been.calledTwice);

		it("should return a list of transactions", () => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("findSubtransactions", () => {
		const expectedResponse = "subtransactions";
		let actualResponse;

		beforeEach(() => {
			$httpBackend.expectGET(/transactions\/123\/subtransactions/).respond(200, expectedResponse);
			actualResponse = transactionModel.findSubtransactions(123);
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /transactions/123/subtransactions", () => {});

		it("should return a list of subtransactions", () => {
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("find", () => {
		const expectedResponse = "transaction";
		let actualResponse;

		beforeEach(() => {
			transactionModel.parse = sinon.stub().returnsArg(0);
			$httpBackend.expectGET(/transactions\/123/).respond(200, expectedResponse);
			actualResponse = transactionModel.find(123);
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /transactions/123", () => {});

		it("should parse the transaction", () => transactionModel.parse.should.have.been.calledWith(expectedResponse));

		it("should return the transaction", () => {
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("save", () => {
		const expectedResponse = "transaction";

		beforeEach(() => {
			transactionModel.invalidateCaches = sinon.stub();
			transactionModel.stringify = sinon.stub().returnsArg(0);
			transactionModel.parse = sinon.stub().returnsArg(0);
			$httpBackend.whenPOST(/transactions$/).respond(200, expectedResponse);
			$httpBackend.whenPATCH(/transactions\/123$/).respond(200, expectedResponse);
		});

		it("should invalidate the associated $http caches", () => {
			transactionModel.save({});
			transactionModel.invalidateCaches.should.have.been.called;
			$httpBackend.flush();
		});

		it("should stringify the transaction", () => {
			const transaction = {};

			transactionModel.save(transaction);
			transactionModel.stringify.should.have.been.calledWith(transaction);
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /transactions when an id is not provided", () => {
			$httpBackend.expectPOST(/transactions$/, {});
			transactionModel.save({});
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /transactions/{id} when an id is provided", () => {
			$httpBackend.expectPATCH(/transactions\/123$/, {id: 123});
			transactionModel.save({id: 123});
			$httpBackend.flush();
		});

		it("should save the transaction date", () => {
			const transactionDate = moment("2000-01-01").toDate();

			transactionModel.save({transaction_date: transactionDate});
			$httpBackend.flush();
			transactionModel.lastTransactionDate.should.deep.equal(transactionDate);
		});

		it("should parse the transaction", () => {
			transactionModel.save({});
			$httpBackend.flush();
			transactionModel.parse.should.have.been.calledWith(expectedResponse);
		});

		it("should return the transaction", () => {
			const actualResponse = transactionModel.save({});

			$httpBackend.flush();
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("destroy", () => {
		beforeEach(() => {
			transactionModel.invalidateCaches = sinon.stub();
			$httpBackend.whenDELETE(/transactions\/123$/).respond(200);
		});

		it("should invalidate the associated $http caches", () => {
			transactionModel.destroy({id: 123});
			transactionModel.invalidateCaches.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /transactions/{id}", () => {
			$httpBackend.expectDELETE(/transactions\/123$/);
			transactionModel.destroy({id: 123});
			$httpBackend.flush();
		});
	});

	describe("invalidateCaches", () => {
		let transaction;

		beforeEach(() => {
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

		it("should invalidate the primary account from the account cache", () => transactionModel.invalidateCache.should.have.been.calledWith(accountModel, "primary_account"));

		it("should invalidate the payee from the payee cache", () => transactionModel.invalidateCache.should.have.been.calledWith(payeeModel, "payee"));

		it("should invalidate the category from the category cache", () => transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "category"));

		it("should invalidate the subcategory from the category cache", () => transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "subcategory"));

		it("should invalidate the account from the account cache", () => transactionModel.invalidateCache.should.have.been.calledWith(accountModel, "account"));

		it("should invalidate the security from the security cache", () => transactionModel.invalidateCache.should.have.been.calledWith(securityModel, "security"));

		it("should invalidate any subtransaction categories from the category cache", () => transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "subtransaction category"));

		it("should invalidate any subtransaction subcategories from the category cache", () => transactionModel.invalidateCache.should.have.been.calledWith(categoryModel, "subtransaction subcategory"));

		it("should invalidate any subtransfer accounts from the account cache", () => transactionModel.invalidateCache.should.have.been.calledWith(accountModel, "subtransfer account"));
	});

	describe("invalidateCache", () => {
		it("should do nothing if the item is an empty string", () => {
			transactionModel.invalidateCache(payeeModel, "");
			payeeModel.flush.should.not.have.been.called;
		});

		it("should flush the $http cache if the item is a non-empty string", () => {
			transactionModel.invalidateCache(payeeModel, "test");
			payeeModel.flush.should.have.been.calledWithExactly();
		});

		it("should do nothing if the item is undefined", () => {
			transactionModel.invalidateCache(payeeModel);
			payeeModel.flush.should.not.have.been.called;
		});

		it("should do nothing if the item is null", () => {
			transactionModel.invalidateCache(payeeModel, null);
			payeeModel.flush.should.not.have.been.called;
		});

		it("should do nothing if the item has no id", () => {
			transactionModel.invalidateCache(payeeModel, {});
			payeeModel.flush.should.not.have.been.called;
		});

		it("should remove the item from the $http cache when the item has an id", () => {
			transactionModel.invalidateCache(payeeModel, {id: 123});
			payeeModel.flush.should.have.been.calledWith(123);
		});
	});

	describe("updateStatus", () => {
		beforeEach(() => {
			$httpBackend.whenPATCH(/context\/transactions\/123\/status\?status$/).respond(200);
			$httpBackend.whenDELETE(/context\/transactions\/123\/status$/).respond(200);
		});

		it("should dispatch a PATCH request to /{context}/transactions/{id}/status?{status} when a status is provided", () => {
			$httpBackend.expectPATCH(/context\/transactions\/123\/status\?status$/);
			transactionModel.updateStatus("context", 123, "status");
		});

		it("should dispatch a DELETE request to /{context}/transactions/{id}/status when a status is not provided", () => {
			$httpBackend.expectDELETE(/context\/transactions\/123\/status$/);
			transactionModel.updateStatus("context", 123);
		});

		afterEach(() => $httpBackend.flush());
	});

	describe("flag", () => {
		it("should dispatch a PUT request to /transactions/{id}/flag", () => {
			$httpBackend.expectPUT(/transactions\/123\/flag/, {memo: "flag"}).respond(200);
			transactionModel.flag({id: 123, flag: "flag"});
			$httpBackend.flush();
		});
	});

	describe("unflag", () => {
		it("should dispatch a DELETE request to /transactions/{id}/flag", () => {
			$httpBackend.expectDELETE(/transactions\/123\/flag/).respond(200);
			transactionModel.unflag(123);
			$httpBackend.flush();
		});
	});

	describe("allDetailsShown", () => {
		it("should be true if the show all details setting is not present", () => transactionModel.allDetailsShown().should.be.true);

		it("should be true if the show all details setting is not set to false", () => {
			$window.localStorage.getItem.withArgs("lootShowAllTransactionDetails").returns("true");
			transactionModel.allDetailsShown().should.be.true;
		});

		it("should be false if the show all details setting is set to false", () => {
			$window.localStorage.getItem.withArgs("lootShowAllTransactionDetails").returns("false");
			transactionModel.allDetailsShown().should.be.false;
		});
	});

	describe("showAllDetails", () => {
		it("should save the show all details setting", () => {
			transactionModel.showAllDetails(true);
			$window.localStorage.setItem.should.have.been.calledWith("lootShowAllTransactionDetails", true);
		});
	});

	describe("lastTransactionDate", () => {
		it("should return the last used transaction date", () => transactionModel.lastTransactionDate.should.deep.equal(moment().startOf("day").toDate()));
	});
});
