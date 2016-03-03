describe("ScheduleEditController", () => {
	let	scheduleEditController,
			controllerTest,
			$uibModalInstance,
			$timeout,
			payeeModel,
			securityModel,
			categoryModel,
			accountModel,
			transactionModel,
			scheduleModel,
			schedule;

	// Load the modules
	beforeEach(module("lootMocks", "lootSchedules", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "schedule"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _$timeout_, _payeeModel_, _securityModel_, _categoryModel_, _accountModel_, _transactionModel_, _scheduleModel_, _schedule_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		$timeout = _$timeout_;
		payeeModel = _payeeModel_;
		securityModel = _securityModel_;
		categoryModel = _categoryModel_;
		accountModel = _accountModel_;
		transactionModel = _transactionModel_;
		scheduleModel = _scheduleModel_;
		schedule = _schedule_;
		scheduleEditController = controllerTest("ScheduleEditController");
	}));

	describe("when a schedule is provided", () => {
		let originalSchedule;

		beforeEach(() => {
			originalSchedule = angular.copy(schedule);
			schedule.id = null;
			schedule.transaction_date = schedule.next_due_date;
		});

		it("should make the passed schedule available to the view", () => scheduleEditController.transaction.should.deep.equal(schedule));

		it("should default the transaction type to Basic if not specified", () => {
			Reflect.deleteProperty(schedule, "transaction_type");
			scheduleEditController = controllerTest("ScheduleEditController");
			scheduleEditController.transaction.transaction_type.should.equal("Basic");
		});

		it("should default the next due date to the current day if not specified", () => {
			Reflect.deleteProperty(schedule, "next_due_date");
			scheduleEditController = controllerTest("ScheduleEditController");
			scheduleEditController.transaction.next_due_date.should.deep.equal(moment().startOf("day").toDate());
		});

		it("should set the mode to Enter Transaction", () => scheduleEditController.mode.should.equal("Enter Transaction"));

		it("should make a copy of the transaction as schedule available to the view", () => {
			scheduleEditController.schedule.id.should.not.be.null;
			scheduleEditController.schedule.should.deep.equal(originalSchedule);
		});

		it("should clear the transaction id", () => (null === scheduleEditController.transaction.id).should.be.true);

		it("should set the transaction date to the next due date", () => scheduleEditController.transaction.transaction_date.should.deep.equal(schedule.next_due_date));
	});

	describe("when a schedule is not provided", () => {
		let transaction;

		beforeEach(() => {
			transaction = {
				transaction_type: "Basic",
				next_due_date: moment().startOf("day").toDate(),
				autoFlag: false
			};

			scheduleEditController = controllerTest("ScheduleEditController", {schedule: null});
		});

		it("should make an empty transaction object available to the view", () => scheduleEditController.transaction.should.deep.equal(transaction));

		it("should set the mode to Add Schedule", () => scheduleEditController.mode.should.equal("Add Schedule"));

		it("should make an alias of the transaction as schedule available to the view", () => scheduleEditController.schedule.should.equal(scheduleEditController.transaction));
	});

	it("should set the auto-flag property when a flag is present", () => {
		schedule.flag = "Test flag";
		scheduleEditController = controllerTest("ScheduleEditController");
		scheduleEditController.schedule.autoFlag.should.be.true;
	});

	it("should not set the auto-flag property when a flag is absent", () => scheduleEditController.schedule.autoFlag.should.be.false);

	it("should set the flag memo to null when the flag memo is '(no memo)'", () => {
		schedule.flag = "(no memo)";
		scheduleEditController = controllerTest("ScheduleEditController");
		(null === scheduleEditController.schedule.flag).should.be.true;
	});

	it("should prefetch the payees list to populate the cache", () => payeeModel.all.should.have.been.called);

	describe("payees", () => {
		let payees;

		beforeEach(() => payees = scheduleEditController.payees("a", 3));

		it("should fetch the list of payees", () => payeeModel.all.should.have.been.called);

		it("should return a filtered & limited list of payees", () => payees.should.eventually.deep.equal([
			{id: 1, name: "aa"},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"}
		]));
	});

	describe("securities", () => {
		let securities;

		beforeEach(() => securities = scheduleEditController.securities("a", 3));

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
			categories = scheduleEditController.categories("a", 3, {});
			categories.should.be.an.Array;
			categories.should.be.empty;
		});

		describe("(parent categories)", () => {
			it("should fetch the list of parent categories", () => {
				categories = scheduleEditController.categories("a", 3, null, false);
				categoryModel.all.should.have.been.calledWith(null);
			});

			it("should include transfer categories", () => {
				categories = scheduleEditController.categories("a", 5, null, false);
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
				categories = scheduleEditController.categories("a", 7, null, true);
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
				categories = scheduleEditController.categories("a", 3, {id: 1});
				categoryModel.all.should.have.been.calledWith(1);
			});

			it("should eventually return a filtered & limited list of subcategories", () => {
				categories = scheduleEditController.categories("a", 3, {id: 1});
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
		it("should return the full list of investment categories when a filter is not specified", () => scheduleEditController.investmentCategories().should.deep.equal([
			{id: "Buy", name: "Buy"},
			{id: "Sell", name: "Sell"},
			{id: "DividendTo", name: "Dividend To"},
			{id: "AddShares", name: "Add Shares"},
			{id: "RemoveShares", name: "Remove Shares"},
			{id: "TransferTo", name: "Transfer To"},
			{id: "TransferFrom", name: "Transfer From"}
		]));

		it("should return a filtered list of investment categories when a filter is specified", () => scheduleEditController.investmentCategories("a").should.deep.equal([
			{id: "AddShares", name: "Add Shares"},
			{id: "RemoveShares", name: "Remove Shares"},
			{id: "TransferTo", name: "Transfer To"},
			{id: "TransferFrom", name: "Transfer From"}
		]));
	});

	describe("isString", () => {
		it("should return false if the object is not a string", () => scheduleEditController.isString({}).should.be.false);

		it("should return false if the object is an empty string", () => scheduleEditController.isString("").should.be.false);

		it("should return true if the object is a string and is not empty", () => scheduleEditController.isString("test").should.be.true);
	});

	describe("payeeSelected", () => {
		let	payee,
				primaryAccount;

		beforeEach(() => {
			scheduleEditController.transaction.id = null;
			payee = {id: 1};
			primaryAccount = {account_type: "account type"};
			scheduleEditController.mode = "Add Schedule";
			scheduleEditController.transaction.payee = payee;
			scheduleEditController.transaction.primary_account = primaryAccount;
			sinon.stub(scheduleEditController, "getSubtransactions");
			sinon.stub(scheduleEditController, "useLastTransaction");
		});

		it("should do nothing when editing an existing schedule", () => {
			scheduleEditController.transaction.id = 1;
			scheduleEditController.transaction.payee = {};
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when the selected payee is not an existing payee", () => {
			scheduleEditController.transaction.payee = "payee";
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when entering a transaction from a schedule", () => {
			scheduleEditController.mode = "Enter Transaction";
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should show a loading indicator", () => {
			scheduleEditController.transaction.payee.id = -1;
			scheduleEditController.payeeSelected();
			scheduleEditController.loadingLastTransaction.should.be.true;
		});

		it("should fetch the last transaction for the selected payee", () => {
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.have.been.calledWith(payee.id, primaryAccount.account_type);
		});

		it("should fetch the subtransactions for the last transaction", () => {
			scheduleEditController.payeeSelected();
			scheduleEditController.getSubtransactions.should.have.been.called;
		});

		it("should default the transaction details from the last transaction", () => {
			scheduleEditController.payeeSelected();
			scheduleEditController.useLastTransaction.should.have.been.called;
		});

		it("should hide the loading indicator", () => {
			scheduleEditController.payeeSelected();
			scheduleEditController.loadingLastTransaction.should.be.false;
		});
	});

	describe("securitySelected", () => {
		let	security,
				primaryAccount;

		beforeEach(() => {
			scheduleEditController.transaction.id = null;
			security = {id: 1};
			primaryAccount = {account_type: "account type"};
			scheduleEditController.mode = "Add Schedule";
			scheduleEditController.transaction.security = security;
			scheduleEditController.transaction.primary_account = primaryAccount;
			sinon.stub(scheduleEditController, "getSubtransactions");
			sinon.stub(scheduleEditController, "useLastTransaction");
		});

		it("should do nothing when editing an existing transaction", () => {
			scheduleEditController.transaction.id = 1;
			scheduleEditController.transaction.security = {};
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when the selected security is not an existing security", () => {
			scheduleEditController.transaction.security = "security";
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when entering a transaction from a schedule", () => {
			scheduleEditController.mode = "Enter Transaction";
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should show a loading indicator", () => {
			scheduleEditController.transaction.security.id = -1;
			scheduleEditController.securitySelected();
			scheduleEditController.loadingLastTransaction.should.be.true;
		});

		it("should fetch the last transaction for the selected security", () => {
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.have.been.calledWith(security.id, primaryAccount.account_type);
		});

		it("should fetch the subtransactions for the last transaction", () => {
			scheduleEditController.securitySelected();
			scheduleEditController.getSubtransactions.should.have.been.called;
		});

		it("should default the transaction details from the last transaction", () => {
			scheduleEditController.securitySelected();
			scheduleEditController.useLastTransaction.should.have.been.called;
		});

		it("should hide the loading indicator", () => {
			scheduleEditController.securitySelected();
			scheduleEditController.loadingLastTransaction.should.be.false;
		});
	});

	describe("getSubtransactions", () => {
		let transaction;

		beforeEach(() => transaction = {id: 1});

		it("should return the transaction if it is not a split, loan repayment or payslip", () => scheduleEditController.getSubtransactions(transaction).should.deep.equal(transaction));

		const scenarios = ["Split", "LoanRepayment", "Payslip"];

		scenarios.forEach(scenario => {
			it("should fetch the subtransactions for the transaction", () => {
				transaction.transaction_type = scenario;
				scheduleEditController.getSubtransactions(transaction);
				transaction.subtransactions.should.be.an.Array;
				transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
			});
		});

		it("should eventually return a list of subtransactions stripped of their ids", () => {
			transaction.transaction_type = "Split";

			const expected = angular.copy(transaction);

			expected.subtransactions = [
				{id: null, transaction_type: "Transfer", account: "subtransfer account"},
				{id: null, category: "subtransaction category"},
				{id: null, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
			];

			transaction = scheduleEditController.getSubtransactions(transaction);
			transaction.should.eventually.deep.equal(expected);
		});
	});

	describe("useLastTransaction", () => {
		let	transaction,
				currentElement,
				mockAngularElement,
				realAngularElement;

		beforeEach(() => {
			// The previous transaction to merge
			transaction = {
				id: 1,
				transaction_date: "transaction date",
				next_due_date: "next due date",
				frequency: "frequency",
				primary_account: "primary account",
				payee: "payee",
				amount: 100,
				status: "Reconciled",
				related_status: "Reconciled",
				flag: "flag"
			};

			// The current transaction to merge into
			scheduleEditController.transaction = {
				payee: "original payee",
				category: "original category"
			};

			mockAngularElement = {
				triggerHandler: sinon.stub()
			};

			currentElement = null;
			realAngularElement = angular.element;
			sinon.stub(angular, "element", selector => {
				if ("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo" === selector) {
					return [currentElement];
				}

				return mockAngularElement;
			});
		});

		it("should strip the transaction of it's id, transaction date, next due date, frequency, primary account, status & related status", () => {
			scheduleEditController.useLastTransaction(transaction);
			(!transaction.id).should.be.true;
			(!transaction.transaction_date).should.be.true;
			(!transaction.next_due_date).should.be.true;
			(!transaction.frequency).should.be.true;
			(!transaction.primary_account).should.be.true;
			(!transaction.status).should.be.true;
			(!transaction.related_status).should.be.true;
		});

		it("should preserve the schedule's flag", () => {
			const flag = "schedule flag";

			scheduleEditController.transaction.flag = flag;
			scheduleEditController.useLastTransaction(transaction);
			scheduleEditController.transaction.flag.should.equal(flag);
		});

		it("should ignore the previous transaction's flag", () => {
			scheduleEditController.transaction.flag = null;
			scheduleEditController.useLastTransaction(transaction);
			(null === scheduleEditController.transaction.flag).should.be.true;
		});

		it("should merge the transaction details into vm.transaction", () => {
			transaction.category = "original category";
			scheduleEditController.useLastTransaction(transaction);
			scheduleEditController.transaction.should.deep.equal(transaction);
		});

		it("should retrigger the amount focus handler if focussed", () => {
			currentElement = document.activeElement;
			scheduleEditController.useLastTransaction(transaction);
			$timeout.flush();
			mockAngularElement.triggerHandler.should.have.been.calledWith("focus");
		});

		it("should not retrigger the amount focus handler if not focussed", () => {
			scheduleEditController.useLastTransaction(transaction);
			mockAngularElement.triggerHandler.should.not.have.been.called;
		});

		afterEach(() => {
			$timeout.verifyNoPendingTasks();
			angular.element = realAngularElement;
		});
	});

	describe("categorySelected", () => {
		describe("(main transaction)", () => {
			beforeEach(() => scheduleEditController.transaction.category = {direction: "inflow"});

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
				let	subtransactions;
				const	memo = "test memo",
							amount = 123;

				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, () => {
					scheduleEditController.transaction.category.id = scenario.id;
					scheduleEditController.categorySelected();
					scheduleEditController.transaction.transaction_type.should.equal(scenario.type);

					if ("Basic" === scenario.type) {
						scheduleEditController.transaction.direction.should.equal(scheduleEditController.transaction.category.direction);
					} else {
						scheduleEditController.transaction.direction.should.equal(scenario.direction);
					}
				});

				if (scenario.subtransactions) {
					it(`should not create any stub subtransactions for a ${scenario.id} if some already exist`, () => {
						subtransactions = "existing subtransactions";
						scheduleEditController.transaction.category.id = scenario.id;
						scheduleEditController.transaction.subtransactions = subtransactions;
						scheduleEditController.categorySelected();
						scheduleEditController.transaction.subtransactions.should.equal(subtransactions);
					});

					it(`should create four stub subtransactions for a ${scenario.id} if none exist`, () => {
						subtransactions = [{memo, amount}, {}, {}, {}];
						scheduleEditController.transaction.category.id = scenario.id;
						scheduleEditController.transaction.subtransactions = null;
						scheduleEditController.transaction.memo = memo;
						scheduleEditController.transaction.amount = amount;
						scheduleEditController.categorySelected();
						scheduleEditController.transaction.subtransactions.should.deep.equal(subtransactions);
					});
				}
			});

			it("should set the transaction type to Basic if the selected category is not an existing category", () => {
				scheduleEditController.transaction.category = "new category";
				scheduleEditController.categorySelected();
				scheduleEditController.transaction.transaction_type.should.equal("Basic");
			});
		});

		describe("(subtransaction)", () => {
			beforeEach(() => scheduleEditController.transaction.subtransactions = [
				{category: {direction: "inflow"}}
			]);

			const scenarios = [
				{id: "TransferTo", type: "Subtransfer", direction: "outflow"},
				{id: "TransferFrom", type: "Subtransfer", direction: "inflow"},
				{id: "anything else", type: "Sub", direction: "the category direction"}
			];

			scenarios.forEach(scenario => {
				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, () => {
					scheduleEditController.transaction.subtransactions[0].category.id = scenario.id;
					scheduleEditController.categorySelected(0);
					scheduleEditController.transaction.subtransactions[0].transaction_type.should.equal(scenario.type);

					if ("Sub" === scenario.type) {
						scheduleEditController.transaction.subtransactions[0].direction.should.equal(scheduleEditController.transaction.subtransactions[0].category.direction);
					} else {
						scheduleEditController.transaction.subtransactions[0].direction.should.equal(scenario.direction);
					}
				});
			});

			it("should set the transaction type to Sub if the selected category is not an existing category", () => {
				scheduleEditController.transaction.subtransactions[0].category = "new category";
				scheduleEditController.categorySelected(0);
				scheduleEditController.transaction.subtransactions[0].transaction_type.should.equal("Sub");
			});
		});

		it("should set the direction to outflow if the selected category is not an existing category", () => {
			scheduleEditController.categorySelected();
			scheduleEditController.transaction.direction.should.equal("outflow");
		});

		it("should clear the subcategory if it's parent no longer matches the selected category", () => {
			scheduleEditController.transaction.subcategory = {
				parent_id: 1
			};
			scheduleEditController.categorySelected();
			(null === scheduleEditController.transaction.subcategory).should.be.true;
		});
	});

	describe("investmentCategorySelected", () => {
		beforeEach(() => scheduleEditController.transaction.category = {});

		it("should do nothing if the selected category is not an existing category", () => {
			const transactionType = "transaction type",
						direction = "direction";

			scheduleEditController.transaction.category = "new category";
			scheduleEditController.transaction.transaction_type = transactionType;
			scheduleEditController.transaction.direction = direction;
			scheduleEditController.investmentCategorySelected();
			scheduleEditController.transaction.transaction_type.should.equal(transactionType);
			scheduleEditController.transaction.direction.should.equal(direction);
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
				scheduleEditController.transaction.category.id = scenario.id;
				scheduleEditController.investmentCategorySelected();
				scheduleEditController.transaction.transaction_type.should.equal(scenario.type);
				scheduleEditController.transaction.direction.should.equal(scenario.direction);
			});
		});
	});

	describe("primaryAccountSelected", () => {
		beforeEach(() => {
			const accountType = "new account type";

			scheduleEditController.transaction.primary_account = {id: 1, account_type: accountType};
		});

		it("should clear the category and subcategory if the account type no longer matches the primary account type", () => {
			scheduleEditController.account_type = "old account type";
			scheduleEditController.primaryAccountSelected();
			(null === scheduleEditController.transaction.category).should.be.true;
			(null === scheduleEditController.transaction.subcategory).should.be.true;
		});

		it("should set the account type to the primary account type", () => {
			scheduleEditController.primaryAccountSelected();
			scheduleEditController.account_type.should.equal("new account type");
		});

		it("should clear the transfer account when the primary account matches", () => {
			scheduleEditController.transaction.account = {id: 1};
			scheduleEditController.primaryAccountSelected();
			(null === scheduleEditController.transaction.account).should.be.true;
		});
	});

	describe("$watch subtransations", () => {
		let subtransactions;

		beforeEach(() => {
			subtransactions = [
				{amount: 10, direction: "outflow"},
				{amount: 5, direction: "inflow"},
				{}
			];
			sinon.stub(scheduleEditController, "memoFromSubtransactions");

			scheduleEditController.transaction.direction = "outflow";
			scheduleEditController.transaction.subtransactions = [{}, {}];
			scheduleEditController.$scope.$digest();
		});

		it("should do nothing if the watched value hasn't changed", () => {
			scheduleEditController.$scope.$digest();
			(null === scheduleEditController.totalAllocated).should.be.true;
		});

		it("should do nothing if there are no subtransactions", () => {
			scheduleEditController.transaction.subtransactions = null;
			scheduleEditController.$scope.$digest();
			(null === scheduleEditController.totalAllocated).should.be.true;
		});

		it("should calculate the total and make it available to the view", () => {
			scheduleEditController.transaction.subtransactions = subtransactions;
			scheduleEditController.$scope.$digest();
			scheduleEditController.totalAllocated.should.equal(5);
		});

		it("should not set the main transaction memo when editing an existing transaction", () => {
			scheduleEditController.transaction.id = 1;
			scheduleEditController.transaction.subtransactions = subtransactions;
			scheduleEditController.$scope.$digest();
			scheduleEditController.memoFromSubtransactions.should.not.have.been.called;
		});

		it("should set the main transaction memo when adding a new transaction", () => {
			scheduleEditController.transaction.subtransactions = subtransactions;
			scheduleEditController.$scope.$digest();
			scheduleEditController.memoFromSubtransactions.should.have.been.called;
		});
	});

	describe("memoFromSubtransactions", () => {
		beforeEach(() => {
			const memo = "memo";

			scheduleEditController.transaction.memo = memo;
			scheduleEditController.transaction.subtransactions = [
				{memo: "memo 1"},
				{memo: "memo 2"},
				{}
			];
		});

		it("should join the sub transaction memos and set the main transaction memo when adding a new transaction", () => {
			scheduleEditController.memoFromSubtransactions();
			scheduleEditController.transaction.memo.should.equal("memo 1; memo 2");
		});
	});

	describe("primaryAccounts", () => {
		let accounts;

		beforeEach(() => accounts = scheduleEditController.primaryAccounts("a", 3));

		it("should fetch the list of accounts", () => accountModel.all.should.have.been.called);

		it("should return a filtered & limited list of accounts", () => accounts.should.eventually.deep.equal([
			{id: 1, name: "aa", account_type: "bank", opening_balance: 100, status: "open"},
			{id: 4, name: "ba", account_type: "asset"},
			{id: 5, name: "ab", account_type: "asset"}
		]));
	});

	describe("accounts", () => {
		let accounts;

		it("should fetch the list of accounts", () => {
			scheduleEditController.accounts();
			accountModel.all.should.have.been.called;
		});

		it("should remove the current account from the list", () => {
			scheduleEditController.transaction.primary_account = {name: "aa"};
			accounts = scheduleEditController.accounts("a", 2);
			accounts.should.eventually.deep.equal([
				{id: 4, name: "ba", account_type: "asset"},
				{id: 5, name: "ab", account_type: "asset"}
			]);
		});

		it("should return a filtered & limited list of non-investment accounts when the transaction type is not Security Transfer", () => {
			accounts = scheduleEditController.accounts("b", 2);
			accounts.should.eventually.deep.equal([
				{id: 4, name: "ba", account_type: "asset"},
				{id: 5, name: "ab", account_type: "asset"}
			]);
		});

		it("should return a filtered & limited list of investment accounts when the transaction type is Security Transfer", () => {
			scheduleEditController.transaction.transaction_type = "SecurityTransfer";
			accounts = scheduleEditController.accounts("b", 2);
			accounts.should.eventually.deep.equal([
				{id: 2, name: "bb", account_type: "investment"},
				{id: 6, name: "bc", account_type: "investment"}
			]);
		});
	});

	describe("frequencies", () => {
		it("should return the full list of frequencies when a filter is not specified", () => scheduleEditController.frequencies().should.deep.equal(["Weekly", "Fortnightly", "Monthly", "Bimonthly", "Quarterly", "Yearly"]));

		it("should return a filtered list of frequencies when a filter is specified", () => scheduleEditController.frequencies("t").should.deep.equal(["Fortnightly", "Monthly", "Bimonthly", "Quarterly"]));
	});

	describe("addSubtransaction", () => {
		it("should add an empty object to the subtransactions array", () => {
			scheduleEditController.transaction.subtransactions = [];
			scheduleEditController.addSubtransaction();
			scheduleEditController.transaction.subtransactions.should.deep.equal([{}]);
		});
	});

	describe("deleteSubtransaction", () => {
		it("should remove an item from the subtransactions array at the specified index", () => {
			scheduleEditController.transaction.subtransactions = [1, 2, 3];
			scheduleEditController.deleteSubtransaction(1);
			scheduleEditController.transaction.subtransactions.should.deep.equal([1, 3]);
		});
	});

	describe("addUnallocatedAmount", () => {
		beforeEach(() => {
			scheduleEditController.transaction.amount = 100;
			scheduleEditController.totalAllocated = 80;
			scheduleEditController.transaction.subtransactions = [
				{amount: 80},
				{amount: null}
			];
		});

		it("should increase an existing subtransaction amount by the unallocated amount", () => {
			scheduleEditController.addUnallocatedAmount(0);
			scheduleEditController.transaction.subtransactions[0].amount.should.equal(100);
		});

		it("should set a blank subtransacion amount to the unallocated amount", () => {
			scheduleEditController.addUnallocatedAmount(1);
			scheduleEditController.transaction.subtransactions[1].amount.should.equal(20);
		});
	});

	describe("calculateNextDue", () => {
		const scenarios = [
			{frequency: "Weekly", period: "weeks", amount: 1},
			{frequency: "Fortnightly", period: "weeks", amount: 2},
			{frequency: "Monthly", period: "month", amount: 1},
			{frequency: "Bimonthly", period: "month", amount: 2},
			{frequency: "Quarterly", period: "months", amount: 3},
			{frequency: "Yearly", period: "year", amount: 1}
		];

		scenarios.forEach(scenario => {
			it(`should add ${scenario.amount} ${scenario.period} to the next due date when the frequency is ${scenario.frequency}`, () => {
				const nextDueDate = scheduleEditController.schedule.next_due_date;

				scheduleEditController.schedule.frequency = scenario.frequency;
				scheduleEditController.calculateNextDue();
				scheduleEditController.schedule.next_due_date.should.deep.equal(moment(nextDueDate).add(scenario.amount, scenario.period).toDate());
			});
		});

		it("should decrement the overdue count when greater than zero", () => {
			scheduleEditController.schedule.overdue_count = 1;
			scheduleEditController.calculateNextDue();
			scheduleEditController.schedule.overdue_count.should.equal(0);
		});

		it("should leave the overdue account unchanged when zero", () => {
			scheduleEditController.schedule.overdue_count = 0;
			scheduleEditController.calculateNextDue();
			scheduleEditController.schedule.overdue_count.should.equal(0);
		});
	});

	describe("updateInvestmentDetails", () => {
		let	amount,
				memo;

		beforeEach(() => {
			amount = 100;
			memo = "memo";
			scheduleEditController.transaction.id = null;
			scheduleEditController.transaction.transaction_type = "SecurityInvestment";
			scheduleEditController.transaction.quantity = 2;
			scheduleEditController.transaction.price = 10;
			scheduleEditController.transaction.commission = 1;
			scheduleEditController.transaction.amount = amount;
			scheduleEditController.transaction.memo = memo;
		});

		it("should do nothing when the transaction type is not SecurityInvestment", () => {
			scheduleEditController.transaction.transaction_type = null;
			scheduleEditController.updateInvestmentDetails();
			scheduleEditController.transaction.amount.should.equal(amount);
			scheduleEditController.transaction.memo.should.equal(memo);
		});

		it("should not update the memo when editing an existing Security Investment transaction", () => {
			scheduleEditController.transaction.id = 1;
			scheduleEditController.updateInvestmentDetails();
			scheduleEditController.transaction.memo.should.equal(memo);
		});

		const scenarios = [
			{direction: "outflow", amount: 19, memo: "less"},
			{direction: "inflow", amount: 21, memo: "plus"}
		];

		scenarios.forEach(scenario => {
			it(`should set the transaction amount to zero and the memo to an empty string if the price, quantity and commission are not specified for a Security Investment transaction when the direction is ${scenario.direction}`, () => {
				scheduleEditController.transaction.direction = scenario.direction;
				scheduleEditController.transaction.quantity = null;
				scheduleEditController.transaction.price = null;
				scheduleEditController.transaction.commission = null;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.amount.should.equal(0);
				scheduleEditController.transaction.memo.should.be.empty;
			});

			it(`should calculate the transaction amount from the price, quantity and commission for a Security Investment transaction when the direction is ${scenario.direction}`, () => {
				scheduleEditController.transaction.direction = scenario.direction;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.amount.should.equal(scenario.amount);
			});

			it(`should update the memo with the price, quantity and commission when adding a new Security Investment transaction when the direction is ${scenario.direction}`, () => {
				scheduleEditController.transaction.direction = scenario.direction;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.memo.should.equal(`2 @ $10.00 (${scenario.memo} $1.00 commission)`);
			});
		});
	});

	describe("edit", () => {
		beforeEach(() => scheduleEditController.edit());

		it("should set the mode to Edit Schedule", () => scheduleEditController.mode.should.equal("Edit Schedule"));

		it("should set the transaction to the schedule", () => scheduleEditController.transaction.should.equal(scheduleEditController.schedule));
	});

	describe("enter", () => {
		beforeEach(() => {
			sinon.stub(scheduleEditController, "skip");
			scheduleEditController.transaction.id = 1;
		});

		it("should reset any previous error messages", () => {
			scheduleEditController.errorMessage = "error message";
			scheduleEditController.enter();
			(null === scheduleEditController.errorMessage).should.be.true;
		});

		it("should save the schedule", () => {
			scheduleEditController.enter();
			transactionModel.save.should.have.been.calledWith(scheduleEditController.transaction);
		});

		it("should update the next due date when the transaction save is successful", () => {
			scheduleEditController.enter();
			scheduleEditController.skip.should.have.been.called;
		});

		it("should display an error message when the transaction save is unsuccessful", () => {
			scheduleEditController.transaction.id = -1;
			scheduleEditController.enter();
			scheduleEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("skip", () => {
		beforeEach(() => {
			sinon.stub(scheduleEditController, "calculateNextDue");
			sinon.stub(scheduleEditController, "save");
			scheduleEditController.skip();
		});

		it("should calculate the next due date", () => {
			scheduleEditController.calculateNextDue.should.have.been.called;
		});

		it("should save the schedule", () => {
			scheduleEditController.save.should.have.been.calledWith(true);
		});
	});

	describe("save", () => {
		it("should reset any previous error messages", () => {
			scheduleEditController.errorMessage = "error message";
			scheduleEditController.save();
			(null === scheduleEditController.errorMessage).should.be.true;
		});

		it("should set the flag memo to '(no memo)' if the auto-flag property is set and the memo is blank", () => {
			scheduleEditController.schedule.autoFlag = true;
			scheduleEditController.save();
			scheduleEditController.schedule.flag.should.equal("(no memo)");
		});

		it("should set the flag to null if the auto-flag property is not set", () => {
			scheduleEditController.schedule.flag = "Test flag";
			scheduleEditController.save();
			(null === scheduleEditController.schedule.flag).should.be.true;
		});

		it("should save the schedule", () => {
			scheduleEditController.save();
			scheduleModel.save.should.have.been.calledWith(schedule);
		});

		it("should close the modal when the schedule save is successful", () => {
			scheduleEditController.save();
			$uibModalInstance.close.should.have.been.calledWith({data: schedule, skipped: false});
		});

		it("should mark the schedule as skipped when the skipped parameter is true", () => {
			scheduleEditController.save(true);
			$uibModalInstance.close.should.have.been.calledWith({data: schedule, skipped: true});
		});

		it("should display an error message when the schedule save is unsuccessful", () => {
			scheduleEditController.schedule.id = -1;
			scheduleEditController.save();
			scheduleEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			scheduleEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
