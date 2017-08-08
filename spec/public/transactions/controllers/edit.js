describe("TransactionEditController", () => {
	let	transactionEditController,
			controllerTest,
			$uibModalInstance,
			$timeout,
			payeeModel,
			securityModel,
			categoryModel,
			accountModel,
			transactionModel,
			transaction;

	// Load the modules
	beforeEach(module("lootMocks", "lootTransactions", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "$q", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "transaction"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _$timeout_, _payeeModel_, _securityModel_, _categoryModel_, _accountModel_, _transactionModel_, _transaction_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		$timeout = _$timeout_;
		payeeModel = _payeeModel_;
		securityModel = _securityModel_;
		categoryModel = _categoryModel_;
		accountModel = _accountModel_;
		transactionModel = _transactionModel_;
		transaction = _transaction_;
		transactionEditController = controllerTest("TransactionEditController");
	}));

	describe("when a transaction is provided", () => {
		it("should make the passed transaction available to the view", () => transactionEditController.transaction.should.deep.equal(transaction));

		it("should set the mode to Edit", () => transactionEditController.mode.should.equal("Edit"));
	});

	describe("when a transaction is not provided", () => {
		beforeEach(() => (transactionEditController = controllerTest("TransactionEditController", {transaction: {}})));

		it("should make the passed transaction available to the view", () => {
			transactionEditController.transaction.should.be.an.Object;
			transactionEditController.transaction.should.be.empty;
		});

		it("should set the mode to Add", () => transactionEditController.mode.should.equal("Add"));
	});

	it("should prefetch the payees list to populate the cache", () => payeeModel.all.should.have.been.called);

	describe("payees", () => {
		let payees;

		beforeEach(() => (payees = transactionEditController.payees("a", 3)));

		it("should fetch the list of payees", () => payeeModel.all.should.have.been.called);

		it("should return a filtered & limited list of payees", () => payees.should.eventually.deep.equal([
			{id: 1, name: "aa"},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"}
		]));
	});

	describe("securities", () => {
		let securities;

		beforeEach(() => (securities = transactionEditController.securities("a", 3)));

		it("should fetch the list of securities", () => securityModel.all.should.have.been.called);

		it("should return a filtered & limited list of securities", () => securities.should.eventually.deep.equal([
			{id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false},
			{id: 4, name: "ba", closing_balance: 4, current_holding: 1, unused: false},
			{id: 5, name: "ab", closing_balance: 5, current_holding: 1, unused: false}
		]));
	});

	describe("categories", () => {
		let categories;

		it("should return an empty array if the parent category is new", () => {
			categories = transactionEditController.categories("a", 3, {});
			categories.should.be.an.Array;
			categories.should.be.empty;
		});

		describe("(parent categories)", () => {
			it("should fetch the list of parent categories", () => {
				categories = transactionEditController.categories("a", 3, null, false);
				categoryModel.all.should.have.been.calledWith(null);
			});

			it("should include transfer categories", () => {
				categories = transactionEditController.categories("a", 5, null, false);
				categories.should.eventually.deep.equal([
					{id: "TransferTo", name: "Transfer To"},
					{id: "TransferFrom", name: "Transfer From"},
					{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
						{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
						{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
					]},
					{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
					{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []}
				]);
			});

			it("should include split categories if requested", () => {
				categories = transactionEditController.categories("a", 7, null, true);
				categories.should.eventually.deep.equal([
					{id: "TransferTo", name: "Transfer To"},
					{id: "TransferFrom", name: "Transfer From"},
					{id: "Payslip", name: "Payslip"},
					{id: "LoanRepayment", name: "Loan Repayment"},
					{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
						{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
						{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
					]},
					{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
					{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []}
				]);
			});
		});

		describe("(subcategories)", () => {
			it("should fetch the subcategories for the specified parent category", () => {
				categories = transactionEditController.categories("a", 3, {id: 1});
				categoryModel.all.should.have.been.calledWith(1);
			});

			it("should eventually return a filtered & limited list of subcategories", () => {
				categories = transactionEditController.categories("a", 3, {id: 1});
				categories.should.eventually.deep.equal([
					{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
						{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
						{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
					]},
					{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
					{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []}
				]);
			});
		});
	});

	describe("investmentCategories", () => {
		it("should return the full list of investment categories when a filter is not specified", () => transactionEditController.investmentCategories().should.deep.equal([
			{id: "Buy", name: "Buy"},
			{id: "Sell", name: "Sell"},
			{id: "DividendTo", name: "Dividend To"},
			{id: "AddShares", name: "Add Shares"},
			{id: "RemoveShares", name: "Remove Shares"},
			{id: "TransferTo", name: "Transfer To"},
			{id: "TransferFrom", name: "Transfer From"}
		]));

		it("should return a filtered list of investment categories when a filter is specified", () => transactionEditController.investmentCategories("a").should.deep.equal([
			{id: "AddShares", name: "Add Shares"},
			{id: "RemoveShares", name: "Remove Shares"},
			{id: "TransferTo", name: "Transfer To"},
			{id: "TransferFrom", name: "Transfer From"}
		]));
	});

	describe("isString", () => {
		it("should return false if the object is not a string", () => transactionEditController.isString({}).should.be.false);

		it("should return false if the object is an empty string", () => transactionEditController.isString("").should.be.false);

		it("should return true if the object is a string and is not empty", () => transactionEditController.isString("test").should.be.true);
	});

	describe("payeeSeleted", () => {
		let	payee,
				primaryAccount;

		beforeEach(() => {
			transactionEditController.transaction.id = null;
			payee = {id: 1};
			primaryAccount = {account_type: "account type"};
			transactionEditController.transaction.payee = payee;
			transactionEditController.transaction.primary_account = primaryAccount;
			sinon.stub(transactionEditController, "getSubtransactions");
			sinon.stub(transactionEditController, "useLastTransaction");
		});

		it("should do nothing when editing an existing transaction", () => {
			transactionEditController.transaction.id = 1;
			transactionEditController.transaction.payee = {};
			transactionEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when the selected payee is not an existing payee", () => {
			transactionEditController.transaction.payee = "payee";
			transactionEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should show a loading indicator", () => {
			transactionEditController.transaction.payee.id = -1;
			transactionEditController.payeeSelected();
			transactionEditController.loadingLastTransaction.should.be.true;
		});

		it("should fetch the last transaction for the selected payee", () => {
			transactionEditController.payeeSelected();
			payeeModel.findLastTransaction.should.have.been.calledWith(payee.id, primaryAccount.account_type);
		});

		it("should fetch the subtransactions for the last transaction", () => {
			transactionEditController.payeeSelected();
			transactionEditController.getSubtransactions.should.have.been.called;
		});

		it("should default the transaction details from the last transaction", () => {
			transactionEditController.payeeSelected();
			transactionEditController.useLastTransaction.should.have.been.called;
		});

		it("should hide the loading indicator", () => {
			transactionEditController.payeeSelected();
			transactionEditController.loadingLastTransaction.should.be.false;
		});
	});

	describe("securitySelected", () => {
		let	security,
				primaryAccount;

		beforeEach(() => {
			transactionEditController.transaction.id = null;
			security = {id: 1};
			primaryAccount = {account_type: "account type"};
			transactionEditController.transaction.security = security;
			transactionEditController.transaction.primary_account = primaryAccount;
			sinon.stub(transactionEditController, "getSubtransactions");
			sinon.stub(transactionEditController, "useLastTransaction");
		});

		it("should do nothing when editing an existing transaction", () => {
			transactionEditController.transaction.id = 1;
			transactionEditController.transaction.security = {};
			transactionEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when the selected security is not an existing security", () => {
			transactionEditController.transaction.security = "security";
			transactionEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should show a loading indicator", () => {
			transactionEditController.transaction.security.id = -1;
			transactionEditController.securitySelected();
			transactionEditController.loadingLastTransaction.should.be.true;
		});

		it("should fetch the last transaction for the selected security", () => {
			transactionEditController.securitySelected();
			securityModel.findLastTransaction.should.have.been.calledWith(security.id, primaryAccount.account_type);
		});

		it("should fetch the subtransactions for the last transaction", () => {
			transactionEditController.securitySelected();
			transactionEditController.getSubtransactions.should.have.been.called;
		});

		it("should default the transaction details from the last transaction", () => {
			transactionEditController.securitySelected();
			transactionEditController.useLastTransaction.should.have.been.called;
		});

		it("should hide the loading indicator", () => {
			transactionEditController.securitySelected();
			transactionEditController.loadingLastTransaction.should.be.false;
		});
	});

	describe("getSubtransactions", () => {
		let splitTransaction;

		beforeEach(() => (splitTransaction = {id: 1}));

		it("should return the transaction if it is not a split, loan repayment or payslip", () => transactionEditController.getSubtransactions(splitTransaction).should.deep.equal(splitTransaction));

		const scenarios = ["Split", "LoanRepayment", "Payslip"];

		scenarios.forEach(scenario => {
			it("should fetch the subtransactions for the transaction", () => {
				splitTransaction.transaction_type = scenario;
				transactionEditController.getSubtransactions(splitTransaction);
				splitTransaction.subtransactions.should.be.an.Array;
				transactionModel.findSubtransactions.should.have.been.calledWith(splitTransaction.id);
			});
		});

		it("should eventually return a list of subtransactions stripped of their ids", () => {
			splitTransaction.transaction_type = "Split";

			const expected = angular.copy(splitTransaction);

			expected.subtransactions = [
				{id: null, transaction_type: "Transfer", account: "subtransfer account"},
				{id: null, category: "subtransaction category"},
				{id: null, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
			];

			splitTransaction = transactionEditController.getSubtransactions(splitTransaction);
			splitTransaction.should.eventually.deep.equal(expected);
		});
	});

	describe("useLastTransaction", () => {
		let	lastTransaction,
				currentElement,
				mockAngularElement,
				realAngularElement;

		beforeEach(() => {
			// The previous transaction to merge
			lastTransaction = {
				id: 1,
				transaction_date: "date",
				primary_account: "primary account",
				payee: "payee",
				amount: 100,
				status: "Reconciled",
				related_status: "Reconciled",
				flag: "flag"
			};

			// The current transaction to merge into
			transactionEditController.transaction = {
				payee: "original payee",
				category: "original category"
			};

			mockAngularElement = {
				triggerHandler: sinon.stub()
			};

			currentElement = null;
			realAngularElement = angular.element;
			sinon.stub(angular, "element").callsFake(selector => {
				if ("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo" === selector) {
					return [currentElement];
				}

				return mockAngularElement;
			});
		});

		it("should strip the transaction of it's id, date, primary account, status, related status & flag", () => {
			transactionEditController.useLastTransaction(lastTransaction);
			(!lastTransaction.id).should.be.true;
			(!lastTransaction.transaction_date).should.be.true;
			(!lastTransaction.primary_account).should.be.true;
			(!lastTransaction.status).should.be.true;
			(!lastTransaction.related_status).should.be.true;
			(!lastTransaction.flag).should.be.true;
		});

		it("should merge the transaction details into vm.transaction", () => {
			lastTransaction.category = "original category";
			transactionEditController.useLastTransaction(lastTransaction);
			transactionEditController.transaction.should.deep.equal(lastTransaction);
		});

		it("should retrigger the focus handler of a refocussable field if focussed", () => {
			currentElement = document.activeElement;
			transactionEditController.useLastTransaction(lastTransaction);
			$timeout.flush();
			mockAngularElement.triggerHandler.should.have.been.calledWith("focus");
		});

		it("should not retrigger the amount focus handler of a refocussable field if not focussed", () => {
			transactionEditController.useLastTransaction(lastTransaction);
			mockAngularElement.triggerHandler.should.not.have.been.called;
		});

		afterEach(() => {
			$timeout.verifyNoPendingTasks();
			angular.element = realAngularElement;
		});
	});

	describe("categorySelected", () => {
		describe("(main transaction)", () => {
			beforeEach(() => (transactionEditController.transaction.category = {direction: "inflow"}));

			const scenarios = [
				{id: "TransferTo", type: "Transfer", direction: "outflow"},
				{id: "TransferFrom", type: "Transfer", direction: "inflow"},
				{id: "SplitTo", type: "Split", direction: "outflow", subtransactions: true},
				{id: "SplitFrom", type: "Split", direction: "inflow", subtransactions: true},
				{id: "Payslip", type: "Payslip", direction: "inflow", subtransactions: true},
				{id: "LoanRepayment", type: "LoanRepayment", direction: "outflow", subtransactions: true},
				{id: "anything else", type: "Basic", direction: "the category direction"}
			];

			scenarios.forEach(scenario => {
				const memo = "test memo",
							amount = 123;
				let subtransactions;

				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, () => {
					transactionEditController.transaction.category.id = scenario.id;
					transactionEditController.categorySelected();
					transactionEditController.transaction.transaction_type.should.equal(scenario.type);

					if ("Basic" === scenario.type) {
						transactionEditController.transaction.direction.should.equal(transactionEditController.transaction.category.direction);
					} else {
						transactionEditController.transaction.direction.should.equal(scenario.direction);
					}
				});

				if (scenario.subtransactions) {
					it(`should not create any stub subtransactions for a ${scenario.id} if some already exist`, () => {
						subtransactions = "existing subtransactions";
						transactionEditController.transaction.category.id = scenario.id;
						transactionEditController.transaction.subtransactions = subtransactions;
						transactionEditController.categorySelected();
						transactionEditController.transaction.subtransactions.should.equal(subtransactions);
					});

					it(`should create four stub subtransactions for a ${scenario.id} if none exist`, () => {
						subtransactions = [{memo, amount}, {}, {}, {}];
						transactionEditController.transaction.category.id = scenario.id;
						transactionEditController.transaction.subtransactions = null;
						transactionEditController.transaction.memo = memo;
						transactionEditController.transaction.amount = amount;
						transactionEditController.categorySelected();
						transactionEditController.transaction.subtransactions.should.deep.equal(subtransactions);
					});
				}
			});

			it("should set the transaction type to Basic if the selected category is not an existing category", () => {
				transactionEditController.transaction.category = "new category";
				transactionEditController.categorySelected();
				transactionEditController.transaction.transaction_type.should.equal("Basic");
			});
		});

		describe("(subtransaction)", () => {
			beforeEach(() => (transactionEditController.transaction.subtransactions = [
				{category: {direction: "inflow"}}
			]));

			const scenarios = [
				{id: "TransferTo", type: "Subtransfer", direction: "outflow"},
				{id: "TransferFrom", type: "Subtransfer", direction: "inflow"},
				{id: "anything else", type: "Sub", direction: "the category direction"}
			];

			scenarios.forEach(scenario => {
				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, () => {
					transactionEditController.transaction.subtransactions[0].category.id = scenario.id;
					transactionEditController.categorySelected(0);
					transactionEditController.transaction.subtransactions[0].transaction_type.should.equal(scenario.type);

					if ("Sub" === scenario.type) {
						transactionEditController.transaction.subtransactions[0].direction.should.equal(transactionEditController.transaction.subtransactions[0].category.direction);
					} else {
						transactionEditController.transaction.subtransactions[0].direction.should.equal(scenario.direction);
					}
				});
			});

			it("should set the transaction type to Sub if the selected category is not an existing category", () => {
				transactionEditController.transaction.subtransactions[0].category = "new category";
				transactionEditController.categorySelected(0);
				transactionEditController.transaction.subtransactions[0].transaction_type.should.equal("Sub");
			});
		});

		it("should set the direction to outflow if the selected category is not an existing category", () => {
			transactionEditController.categorySelected();
			transactionEditController.transaction.direction.should.equal("outflow");
		});

		it("should clear the subcategory if it's parent no longer matches the selected category", () => {
			transactionEditController.transaction.subcategory = {
				parent_id: 1
			};
			transactionEditController.categorySelected();
			(null === transactionEditController.transaction.subcategory).should.be.true;
		});
	});

	describe("investmentCategorySelected", () => {
		beforeEach(() => (transactionEditController.transaction.category = {}));

		it("should do nothing if the selected category is not an existing category", () => {
			const transactionType = "transaction type",
						direction = "direction";

			transactionEditController.transaction.category = "new category";
			transactionEditController.transaction.transaction_type = transactionType;
			transactionEditController.transaction.direction = direction;
			transactionEditController.investmentCategorySelected();
			transactionEditController.transaction.transaction_type.should.equal(transactionType);
			transactionEditController.transaction.direction.should.equal(direction);
		});

		const scenarios = [
			{id: "TransferTo", type: "SecurityTransfer", direction: "outflow"},
			{id: "TransferFrom", type: "SecurityTransfer", direction: "inflow"},
			{id: "RemoveShares", type: "SecurityHolding", direction: "outflow"},
			{id: "AddShares", type: "SecurityHolding", direction: "inflow"},
			{id: "Sell", type: "SecurityInvestment", direction: "outflow"},
			{id: "Buy", type: "SecurityInvestment", direction: "inflow"},
			{id: "DividendTo", type: "Dividend", direction: "outflow"}
		];

		scenarios.forEach(scenario => {
			it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, () => {
				transactionEditController.transaction.category.id = scenario.id;
				transactionEditController.investmentCategorySelected();
				transactionEditController.transaction.transaction_type.should.equal(scenario.type);
				transactionEditController.transaction.direction.should.equal(scenario.direction);
			});
		});
	});

	describe("$watch subtransations", () => {
		beforeEach(() => {
			transactionEditController.transaction.direction = "outflow";
			transactionEditController.transaction.subtransactions = [
				{amount: 10, direction: "outflow"},
				{amount: 5, direction: "inflow"},
				{}
			];
			sinon.stub(transactionEditController, "memoFromSubtransactions");
		});

		it("should do nothing if there are no subtransactions", () => {
			transactionEditController.transaction.subtransactions = null;
			transactionEditController.$scope.$digest();
			(null === transactionEditController.totalAllocated).should.be.true;
		});

		it("should calculate the total and make it available to the view", () => {
			transactionEditController.$scope.$digest();
			transactionEditController.totalAllocated.should.equal(5);
		});

		it("should not set the main transaction memo when editing an existing transaction", () => {
			transactionEditController.$scope.$digest();
			transactionEditController.memoFromSubtransactions.should.not.have.been.called;
		});

		it("should set the main transaction memos when adding a new transaction", () => {
			transactionEditController.transaction.id = null;
			transactionEditController.$scope.$digest();
			transactionEditController.memoFromSubtransactions.should.have.been.called;
		});
	});

	describe("memoFromSubtransactions", () => {
		beforeEach(() => {
			const memo = "memo";

			transactionEditController.transaction.memo = memo;
			transactionEditController.transaction.subtransactions = [
				{memo: "memo 1"},
				{memo: "memo 2"},
				{}
			];
		});

		it("should join the sub transaction memos and set the main transaction memo", () => {
			transactionEditController.memoFromSubtransactions();
			transactionEditController.transaction.memo.should.equal("memo 1; memo 2");
		});
	});

	describe("accounts", () => {
		let accounts;

		beforeEach(() => (transactionEditController.transaction.primary_account = null));

		it("should fetch the list of accounts", () => {
			transactionEditController.accounts();
			accountModel.all.should.have.been.called;
		});

		it("should remove the current account from the list", () => {
			transactionEditController.transaction.primary_account = {name: "aa"};
			accounts = transactionEditController.accounts("a", 2);
			accounts.should.eventually.deep.equal([
				{id: 4, name: "ba", account_type: "asset"},
				{id: 5, name: "ab", account_type: "asset"}
			]);
		});

		it("should return a filtered & limited list of non-investment accounts when the transaction type is not Security Transfer", () => {
			accounts = transactionEditController.accounts("b", 2);
			accounts.should.eventually.deep.equal([
				{id: 4, name: "ba", account_type: "asset"},
				{id: 5, name: "ab", account_type: "asset"}
			]);
		});

		it("should return a filtered & limited list of investment accounts when the transaction type is Security Transfer", () => {
			transactionEditController.transaction.transaction_type = "SecurityTransfer";
			accounts = transactionEditController.accounts("b", 2);
			accounts.should.eventually.deep.equal([
				{id: 2, name: "bb", account_type: "investment"},
				{id: 6, name: "bc", account_type: "investment"}
			]);
		});
	});

	describe("primaryAccountSelected", () => {
		it("should do nothing when the transfer account is null", () => {
			transactionEditController.transaction.account = null;
			transactionEditController.primaryAccountSelected();
			(null === transactionEditController.transaction.account).should.be.true;
		});

		it("should clear the transfer account when the primary account matches", () => {
			transactionEditController.transaction.account = {id: 1};
			transactionEditController.transaction.primary_account = {id: 1};
			transactionEditController.primaryAccountSelected();
			(null === transactionEditController.transaction.account).should.be.true;
		});
	});

	describe("addSubtransaction", () => {
		it("should add an empty object to the subtransactions array", () => {
			transactionEditController.transaction.subtransactions = [];
			transactionEditController.addSubtransaction();
			transactionEditController.transaction.subtransactions.should.deep.equal([{}]);
		});
	});

	describe("deleteSubtransaction", () => {
		it("should remove an item from the subtransactions array at the specified index", () => {
			transactionEditController.transaction.subtransactions = [1, 2, 3];
			transactionEditController.deleteSubtransaction(1);
			transactionEditController.transaction.subtransactions.should.deep.equal([1, 3]);
		});
	});

	describe("addUnallocatedAmount", () => {
		beforeEach(() => {
			transactionEditController.transaction.amount = 100;
			transactionEditController.totalAllocated = 80;
			transactionEditController.transaction.subtransactions = [
				{amount: 80},
				{amount: null}
			];
		});

		it("should increase an existing subtransaction amount by the unallocated amount", () => {
			transactionEditController.addUnallocatedAmount(0);
			transactionEditController.transaction.subtransactions[0].amount.should.equal(100);
		});

		it("should set a blank subtransacion amount to the unallocated amount", () => {
			transactionEditController.addUnallocatedAmount(1);
			transactionEditController.transaction.subtransactions[1].amount.should.equal(20);
		});
	});

	describe("updateInvestmentDetails", () => {
		let	amount,
				memo;

		beforeEach(() => {
			amount = 100;
			memo = "memo";
			transactionEditController.transaction.id = null;
			transactionEditController.transaction.transaction_type = "SecurityInvestment";
			transactionEditController.transaction.quantity = 2;
			transactionEditController.transaction.price = 10;
			transactionEditController.transaction.commission = 1;
			transactionEditController.transaction.amount = amount;
			transactionEditController.transaction.memo = memo;
		});

		it("should do nothing when the transaction type is not SecurityInvestment", () => {
			transactionEditController.transaction.transaction_type = null;
			transactionEditController.updateInvestmentDetails();
			transactionEditController.transaction.amount.should.equal(amount);
			transactionEditController.transaction.memo.should.equal(memo);
		});

		it("should not update the memo when editing an existing Security Investment transaction", () => {
			transactionEditController.transaction.id = 1;
			transactionEditController.updateInvestmentDetails();
			transactionEditController.transaction.memo.should.equal(memo);
		});

		const scenarios = [
			{direction: "outflow", amount: 19, memo: "less"},
			{direction: "inflow", amount: 21, memo: "plus"}
		];

		scenarios.forEach(scenario => {
			it(`should set the transaction amount to zero and the memo to an empty string if the price, quantity and commission are not specified for a Security Investment transaction when the direction is ${scenario.direction}`, () => {
				transactionEditController.transaction.direction = scenario.direction;
				transactionEditController.transaction.quantity = null;
				transactionEditController.transaction.price = null;
				transactionEditController.transaction.commission = null;
				transactionEditController.updateInvestmentDetails();
				transactionEditController.transaction.amount.should.equal(0);
				transactionEditController.transaction.memo.should.be.empty;
			});

			it(`should calculate the transaction amount from the price, quantity and commission for a Security Investment transaction when the direction is ${scenario.direction}`, () => {
				transactionEditController.transaction.direction = scenario.direction;
				transactionEditController.updateInvestmentDetails();
				transactionEditController.transaction.amount.should.equal(scenario.amount);
			});

			it(`should update the memo with the price, quantity and commission when adding a new Security Investment transaction when the direction is ${scenario.direction}`, () => {
				transactionEditController.transaction.direction = scenario.direction;
				transactionEditController.updateInvestmentDetails();
				transactionEditController.transaction.memo.should.equal(`2 @ $10.00 (${scenario.memo} $1.00 commission)`);
			});
		});
	});

	describe("invalidateCaches", () => {
		let	original,
				saved,
				subtransaction;

		beforeEach(() => {
			original = {
				id: 1,
				primary_account: {id: 1},
				payee: {id: 1},
				security: {id: 1},
				category: {id: 1},
				subcategory: {id: 1},
				account: {id: 1}
			};

			saved = angular.copy(original);

			subtransaction = {
				category: {id: "subtransaction category id"},
				subcategory: {id: "subtransaction subcategory id"},
				account: {id: "subtransfer account id"}
			};

			transactionModel.findSubtransactions = sinon.stub().returns({
				then(callback) {
					callback(subtransaction ? [subtransaction] : []);
				}
			});

			transactionEditController = controllerTest("TransactionEditController", {transaction: original});
		});

		it("should do nothing if the original values are undefined", () => {
			transactionEditController = controllerTest("TransactionEditController", {transaction: {}});
			transactionEditController.invalidateCaches(saved);
			accountModel.flush.should.not.have.been.called;
			payeeModel.flush.should.not.have.been.called;
			categoryModel.flush.should.not.have.been.called;
			securityModel.flush.should.not.have.been.called;
		});

		it("should do nothing if the original values are unchanged", () => {
			transactionEditController.invalidateCaches(saved);
			accountModel.flush.should.not.have.been.called;
			payeeModel.flush.should.not.have.been.called;
			categoryModel.flush.should.not.have.been.called;
			securityModel.flush.should.not.have.been.called;
		});

		it("should invalidate the original primary account if changed", () => {
			saved.primary_account.id = 2;
			transactionEditController.invalidateCaches(saved);
			accountModel.flush.should.have.been.calledWith(original.primary_account.id);
		});

		it("should invalidate the original payee if changed", () => {
			saved.payee.id = 2;
			transactionEditController.invalidateCaches(saved);
			payeeModel.flush.should.have.been.calledWith(original.payee.id);
		});

		it("should invalidate the original category if changed", () => {
			saved.category.id = 2;
			transactionEditController.invalidateCaches(saved);
			categoryModel.flush.should.have.been.calledWith(original.category.id);
		});

		it("should invalidate the original subcategory if changed", () => {
			saved.subcategory.id = 2;
			transactionEditController.invalidateCaches(saved);
			categoryModel.flush.should.have.been.calledWith(original.subcategory.id);
		});

		it("should invalidate the original account if changed", () => {
			saved.account.id = 2;
			transactionEditController.invalidateCaches(saved);
			accountModel.flush.should.have.been.calledWith(original.account.id);
		});

		it("should invalidate the original security if changed", () => {
			saved.security.id = 2;
			transactionEditController.invalidateCaches(saved);
			securityModel.flush.should.have.been.calledWith(original.security.id);
		});

		const scenarios = ["Split", "LoanRepayment", "Payslip"];

		scenarios.forEach(scenario => {
			it(`should fetch the subtransactions when the type is ${scenario}`, () => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest("TransactionEditController", {transaction: original});
				transactionEditController.invalidateCaches(saved);
				transactionModel.findSubtransactions.should.have.been.calledWith(original.id);
			});

			it("should do nothing if subtransaction values are undefined", () => {
				original.transaction_type = scenario;
				subtransaction = null;
				transactionEditController = controllerTest("TransactionEditController", {transaction: original});
				transactionEditController.invalidateCaches(saved);
				categoryModel.flush.should.not.have.been.called;
				accountModel.flush.should.not.have.been.called;
			});

			it("should do nothing if subtransaction ids are undefined", () => {
				original.transaction_type = scenario;
				subtransaction.category.id = null;
				subtransaction.subcategory.id = null;
				subtransaction.account.id = null;
				transactionEditController = controllerTest("TransactionEditController", {transaction: original});
				transactionEditController.invalidateCaches(saved);
				categoryModel.flush.should.not.have.been.called;
				accountModel.flush.should.not.have.been.called;
			});

			it("should invalidate the subtransaction category if defined", () => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest("TransactionEditController", {transaction: original});
				transactionEditController.invalidateCaches(saved);
				categoryModel.flush.should.have.been.calledWith(subtransaction.category.id);
			});

			it("should invalidate the subtransaction subcategory if defined", () => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest("TransactionEditController", {transaction: original});
				transactionEditController.invalidateCaches(saved);
				categoryModel.flush.should.have.been.calledWith(subtransaction.subcategory.id);
			});

			it("should invalidate the subtransfer account if defined", () => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest("TransactionEditController", {transaction: original});
				transactionEditController.invalidateCaches(saved);
				accountModel.flush.should.have.been.calledWith(subtransaction.account.id);
			});
		});

		it("should eventually be fulfilled", () => transactionEditController.invalidateCaches(saved).should.be.fulfilled);
	});

	describe("updateLruCaches", () => {
		let	data,
				scenarios = ["Transfer", "SecurityTransfer", "SecurityInvestment", "Dividend"];

		beforeEach(() => {
			data = {
				id: 1,
				transaction_type: "Basic",
				primary_account: "primary account",
				payee: "payee",
				security: "security",
				category: "category",
				subcategory: "subcategory",
				account: "account"
			};
		});

		it("should add the primary account to the recent list", () => {
			transactionEditController.updateLruCaches(data);
			accountModel.addRecent.should.have.been.calledWith(data.primary_account);
		});

		it("should add the payee to the recent list for a non-investment account", () => {
			transactionEditController.updateLruCaches(data);
			payeeModel.addRecent.should.have.been.calledWith(data.payee);
			securityModel.addRecent.should.not.have.been.called;
		});

		it("should add the security to the recent list for an investment account", () => {
			data.primary_account = {account_type: "investment"};
			transactionEditController.updateLruCaches(data);
			securityModel.addRecent.should.have.been.calledWith(data.security);
			payeeModel.addRecent.should.not.have.been.called;
		});

		it("should add the category to the recent list if the type is Basic", () => {
			transactionEditController.updateLruCaches(data);
			categoryModel.addRecent.should.have.been.calledWith(data.category);
		});

		it("should not try to add the subcategory to the recent list if the type is Basic but there is no subcategory", () => {
			data.subcategory = null;
			transactionEditController.updateLruCaches(data);
			categoryModel.addRecent.should.have.been.calledOnce;
		});

		it("should add the subcategory to the recent list if the type is Basic", () => {
			transactionEditController.updateLruCaches(data);
			categoryModel.addRecent.should.have.been.calledTwice;
			categoryModel.addRecent.should.have.been.calledWith(data.subcategory);
		});

		scenarios.forEach(scenario => {
			it(`should add the account to the recent list if the type is ${scenario}`, () => {
				data.transaction_type = scenario;
				transactionEditController.updateLruCaches(data);
				accountModel.addRecent.should.have.been.calledWith(data.account);
			});
		});

		scenarios = ["Split", "LoanRepayment", "Payslip"];

		scenarios.forEach(scenario => {
			it(`should fetch the subtransactions when the type is ${scenario}`, () => {
				data.transaction_type = scenario;
				transactionEditController.updateLruCaches(data);
				transactionModel.findSubtransactions.should.have.been.calledWith(data.id);
			});

			it("should add the subtransaction account to the recent list for Subtranfers", () => {
				data.transaction_type = scenario;
				transactionEditController.updateLruCaches(data);
				accountModel.addRecent.should.have.been.calledWith("subtransfer account");
			});

			it("should add the subtransaction category to the recent list for Subtransactions", () => {
				data.transaction_type = scenario;
				transactionEditController.updateLruCaches(data);
				categoryModel.addRecent.should.have.been.calledWith("subtransaction category");
			});

			it("should not try to add the subtransaction subcategory to the recent list for Subtransactions if there is no subcategory", () => {
				data.transaction_type = scenario;
				transactionEditController.updateLruCaches(data);
				categoryModel.addRecent.should.have.been.calledThrice;
			});

			it("should add the subtransaction subcategory to the recent list for Subtransactions", () => {
				data.transaction_type = scenario;
				transactionEditController.updateLruCaches(data);
				categoryModel.addRecent.should.have.been.calledWith("subtransaction subcategory");
			});
		});

		it("should eventually be fulfilled", () => transactionEditController.updateLruCaches(data).should.be.fulfilled);
	});

	describe("save", () => {
		it("should reset any previous error messages", () => {
			transactionEditController.errorMessage = "error message";
			transactionEditController.save();
			(null === transactionEditController.errorMessage).should.be.true;
		});

		it("should save the transaction", () => {
			transactionEditController.save();
			transactionModel.save.should.have.been.calledWith(transaction);
		});

		it("should invalidate the $http caches", () => {
			sinon.spy(transactionEditController, "invalidateCaches");
			transactionEditController.save();
			transactionEditController.invalidateCaches.should.have.been.calledWith(transaction);
		});

		it("should update the LRU caches", () => {
			sinon.spy(transactionEditController, "updateLruCaches");
			transactionEditController.save();
			transactionEditController.updateLruCaches.should.have.been.calledWith(transaction);
		});

		it("should close the modal when the transaction save is successful", () => {
			transactionEditController.save();
			$uibModalInstance.close.should.have.been.calledWith(transaction);
		});

		it("should display an error message when the transaction save unsuccessful", () => {
			transactionEditController.transaction.id = -1;
			transactionEditController.save();
			transactionEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			transactionEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
