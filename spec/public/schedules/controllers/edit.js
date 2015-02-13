(function() {
	"use strict";

	/*jshint expr: true */

	describe("ScheduleEditController", function() {
		// The object under test
		var scheduleEditController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				$timeout,
				payeeModel,
				securityModel,
				categoryModel,
				accountModel,
				transactionModel,
				scheduleModel,
				schedule,
				mockJQueryInstance,
				realJQueryInstance,
				currentElement;

		// Load the modules
		beforeEach(module("lootMocks", "schedules", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "schedule"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _$timeout_, _payeeModel_, _securityModel_, _categoryModel_, _accountModel_, _transactionModel_, _scheduleModel_, _schedule_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			$timeout = _$timeout_;
			payeeModel = _payeeModel_;
			securityModel = _securityModel_;
			categoryModel = _categoryModel_;
			accountModel = _accountModel_;
			transactionModel = _transactionModel_;
			scheduleModel = _scheduleModel_;
			schedule = _schedule_;
			currentElement = undefined;
			mockJQueryInstance = {
				get: function() {
					return currentElement;
				},
				triggerHandler: sinon.stub()
			};

			realJQueryInstance = window.$;
			window.$ = sinon.stub();
			window.$.withArgs("#amount").returns(mockJQueryInstance);

			scheduleEditController = controllerTest("ScheduleEditController");
		}));

		afterEach(function() {
			window.$ = realJQueryInstance;
		});

		describe("when a schedule is provided", function() {
			var originalSchedule;

			beforeEach(function() {
				originalSchedule = angular.copy(schedule);
				schedule.id = null;
				schedule.transaction_date = schedule.next_due_date;
			});

			it("should make the passed schedule available to the view", function() {
				scheduleEditController.transaction.should.deep.equal(schedule);
			});

			it("should default the transaction type to Basic if not specified", function() {
				delete schedule.transaction_type;
				scheduleEditController = controllerTest("ScheduleEditController");
				scheduleEditController.transaction.transaction_type.should.equal("Basic");
			});

			it("should default the next due date to the current day if not specified", function() {
				delete schedule.next_due_date;
				scheduleEditController = controllerTest("ScheduleEditController");
				scheduleEditController.transaction.next_due_date.should.deep.equal(moment().startOf("day").toDate());
			});

			it("should set the mode to Enter Transaction", function() {
				scheduleEditController.mode.should.equal("Enter Transaction");
			});

			it("should make a copy of the transaction as schedule available to the view", function() {
				scheduleEditController.schedule.id.should.not.be.null;
				scheduleEditController.schedule.should.deep.equal(originalSchedule);
			});

			it("should clear the transaction id", function() {
				(null === scheduleEditController.transaction.id).should.be.true;
			});

			it("should set the transaction date to the next due date", function() {
				scheduleEditController.transaction.transaction_date.should.deep.equal(schedule.next_due_date);
			});
		});

		describe("when a schedule is not provided", function() {
			var transaction;

			beforeEach(function() {
				transaction = {
					transaction_type: "Basic",
					next_due_date: moment().startOf("day").toDate(),
					autoFlag: false
				};

				scheduleEditController = controllerTest("ScheduleEditController", {schedule: undefined});
			});

			it("should make an empty transaction object available to the view", function() {
				scheduleEditController.transaction.should.deep.equal(transaction);
			});

			it("should set the mode to Add Schedule", function() {
				scheduleEditController.mode.should.equal("Add Schedule");
			});

			it("should make an alias of the transaction as schedule available to the view", function() {
				scheduleEditController.schedule.should.equal(scheduleEditController.transaction);
			});
		});

		it("should set the auto-flag property when a flag is present", function() {
			schedule.flag = "Test flag";
			scheduleEditController = controllerTest("ScheduleEditController");
			scheduleEditController.schedule.autoFlag.should.be.true;
		});

		it("should not set the auto-flag property when a flag is absent", function() {
			scheduleEditController.schedule.autoFlag.should.be.false;
		});

		it("should set the flag memo to null when the flag memo is '(no memo)'", function() {
			schedule.flag = "(no memo)";
			scheduleEditController = controllerTest("ScheduleEditController");
			(null === scheduleEditController.schedule.flag).should.be.true;
		});

		it("should prefetch the payees list to populate the cache", function() {
			payeeModel.all.should.have.been.called;
		});

		describe("payees", function() {
			var payees;

			beforeEach(function() {
				payees = scheduleEditController.payees("a", 3);
			});

			it("should fetch the list of payees", function() {
				payeeModel.all.should.have.been.called;
			});

			it("should return a filtered & limited list of payees", function() {
				payees.should.eventually.deep.equal([
					{id: 1, name: "aa"},
					{id: 4, name: "ba"},
					{id: 5, name: "ab"}
				]);
			});
		});

		describe("securities", function() {
			var securities;

			beforeEach(function() {
				securities = scheduleEditController.securities("a", 3);
			});

			it("should fetch the list of securities", function() {
				securityModel.all.should.have.been.called;
			});

			it("should return a filtered & limited list of securities", function() {
				securities.should.eventually.deep.equal([
					{id: 1, name: "aa", closing_balance: 1.006, current_holding: 1, unused: false},
					{id: 4, name: "ba", closing_balance: 4, current_holding: 1, unused: false},
					{id: 5, name: "ab", closing_balance: 5, current_holding: 1, unused: false}
				]);
			});
		});

		describe("categories", function() {
			var categories;

			it("should return an empty array if the parent category is new", function() {
				categories = scheduleEditController.categories("a", 3, {});
				categories.should.be.an.Array;
				categories.should.be.empty;
			});

			describe("(parent categories)", function() {
				it("should fetch the list of parent categories", function() {
					categories = scheduleEditController.categories("a", 3, undefined, false);
					categoryModel.all.should.have.been.calledWith(null);
				});

				it("should include transfer categories", function() {
					categories = scheduleEditController.categories("a", 5, undefined, false);
					categories.should.eventually.deep.equal([
						{ id: "TransferTo", name: "Transfer To" },
						{ id: "TransferFrom", name: "Transfer From" },
						{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
							{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
							{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
						]},
						{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
						{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []}
					]);
				});

				it("should include split categories if requested", function() {
					categories = scheduleEditController.categories("a", 7, undefined, true);
					categories.should.eventually.deep.equal([
						{ id: "TransferTo", name: "Transfer To" },
						{ id: "TransferFrom", name: "Transfer From" },
						{ id: "Payslip", name: "Payslip" },
						{ id: "LoanRepayment", name: "Loan Repayment" },
						{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
							{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
							{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
						]},
						{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
						{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []}
					]);
				});
			});

			describe("(subcategories)", function() {
				it("should fetch the subcategories for the specified parent category", function() {
					categories = scheduleEditController.categories("a", 3, {id: 1});
					categoryModel.all.should.have.been.calledWith(1);
				});
				it("should eventually return a filtered & limited list of subcategories", function() {
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

		describe("investmentCategories", function() {
			it("should return a filtered & limited list of investment categories", function() {
				scheduleEditController.investmentCategories("a", 3).should.deep.equal([
					{ id: "AddShares", name: "Add Shares" },
					{ id: "RemoveShares", name: "Remove Shares" },
					{ id: "TransferTo", name: "Transfer To" }
				]);
			});
		});

		describe("isString", function() {
			it("should return false if the object is not a string", function() {
				scheduleEditController.isString({}).should.be.false;
			});

			it("should return false if the object is an empty string", function() {
				scheduleEditController.isString("").should.be.false;
			});

			it("should return true if the object is a string and is not empty", function() {
				scheduleEditController.isString("test").should.be.true;
			});
		});
		
		describe("payeeSelected", function() {
			var payee,
					primary_account;

			beforeEach(function() {
				scheduleEditController.transaction.id = undefined;
				payee = {id: 1};
				primary_account = {account_type: "account type"};
				scheduleEditController.mode = "Add Schedule";
				scheduleEditController.transaction.payee = payee;
				scheduleEditController.transaction.primary_account = primary_account;
				sinon.stub(scheduleEditController, "getSubtransactions");
				sinon.stub(scheduleEditController, "useLastTransaction");
			});

			it("should do nothing when editing an existing schedule", function() {
				scheduleEditController.transaction.id = 1;
				scheduleEditController.transaction.payee = {};
				scheduleEditController.payeeSelected();
				payeeModel.findLastTransaction.should.not.have.been.called;
			});

			it("should do nothing when the selected payee is not an existing payee", function() {
				scheduleEditController.transaction.payee = "payee";
				scheduleEditController.payeeSelected();
				payeeModel.findLastTransaction.should.not.have.been.called;
			});

			it("should do nothing when entering a transaction from a schedule", function() {
				scheduleEditController.mode = "Enter Transaction";
				scheduleEditController.payeeSelected();
				payeeModel.findLastTransaction.should.not.have.been.called;
			});

			it("should show a loading indicator", function() {
				scheduleEditController.transaction.payee.id = -1;
				scheduleEditController.payeeSelected();
				scheduleEditController.loadingLastTransaction.should.be.true;
			});

			it("should fetch the last transaction for the selected payee", function() {
				scheduleEditController.payeeSelected();
				payeeModel.findLastTransaction.should.have.been.calledWith(payee.id, primary_account.account_type);
			});

			it("should fetch the subtransactions for the last transaction", function() {
				scheduleEditController.payeeSelected();
				scheduleEditController.getSubtransactions.should.have.been.called;
			});

			it("should default the transaction details from the last transaction", function() {
				scheduleEditController.payeeSelected();
				scheduleEditController.useLastTransaction.should.have.been.called;
			});

			it("should hide the loading indicator", function() {
				scheduleEditController.payeeSelected();
				scheduleEditController.loadingLastTransaction.should.be.false;
			});
		});

		describe("securitySelected", function() {
			var security,
					primary_account;

			beforeEach(function() {
				scheduleEditController.transaction.id = undefined;
				security = {id: 1};
				primary_account = {account_type: "account type"};
				scheduleEditController.mode = "Add Schedule";
				scheduleEditController.transaction.security = security;
				scheduleEditController.transaction.primary_account = primary_account;
				sinon.stub(scheduleEditController, "getSubtransactions");
				sinon.stub(scheduleEditController, "useLastTransaction");
			});

			it("should do nothing when editing an existing transaction", function() {
				scheduleEditController.transaction.id = 1;
				scheduleEditController.transaction.security = {};
				scheduleEditController.securitySelected();
				securityModel.findLastTransaction.should.not.have.been.called;
			});

			it("should do nothing when the selected security is not an existing security", function() {
				scheduleEditController.transaction.security = "security";
				scheduleEditController.securitySelected();
				securityModel.findLastTransaction.should.not.have.been.called;
			});

			it("should do nothing when entering a transaction from a schedule", function() {
				scheduleEditController.mode = "Enter Transaction";
				scheduleEditController.securitySelected();
				securityModel.findLastTransaction.should.not.have.been.called;
			});

			it("should show a loading indicator", function() {
				scheduleEditController.transaction.security.id = -1;
				scheduleEditController.securitySelected();
				scheduleEditController.loadingLastTransaction.should.be.true;
			});

			it("should fetch the last transaction for the selected security", function() {
				scheduleEditController.securitySelected();
				securityModel.findLastTransaction.should.have.been.calledWith(security.id, primary_account.account_type);
			});

			it("should fetch the subtransactions for the last transaction", function() {
				scheduleEditController.securitySelected();
				scheduleEditController.getSubtransactions.should.have.been.called;
			});

			it("should default the transaction details from the last transaction", function() {
				scheduleEditController.securitySelected();
				scheduleEditController.useLastTransaction.should.have.been.called;
			});

			it("should hide the loading indicator", function() {
				scheduleEditController.securitySelected();
				scheduleEditController.loadingLastTransaction.should.be.false;
			});
		});

		describe("getSubtransactions", function() {
			var transaction;

			beforeEach(function() {
				transaction = {id: 1};
			});

			it("should return the transaction if it is not a split, loan repayment or payslip", function() {
				scheduleEditController.getSubtransactions(transaction).should.deep.equal(transaction);
			});

			var scenarios = ["Split", "LoanRepayment", "Payslip"];

			scenarios.forEach(function(scenario) {
				it("should fetch the subtransactions for the transaction", function() {
					transaction.transaction_type = scenario;
					scheduleEditController.getSubtransactions(transaction);
					transaction.subtransactions.should.be.an.Array;
					transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
				});
			});

			it("should eventually return a list of subtransactions stripped of their ids", function() {
				transaction.transaction_type = "Split";

				var expected = angular.copy(transaction);
				expected.subtransactions = [
					{id: null, transaction_type: "Transfer", account: "subtransfer account"},
					{id: null, category: "subtransaction category"},
					{id: null, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
				];

				transaction = scheduleEditController.getSubtransactions(transaction);
				transaction.should.eventually.deep.equal(expected);
			});
		});
		
		describe("useLastTransaction", function() {
			var transaction;

			beforeEach(function() {
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
			});

			it("should strip the transaction of it's id, transaction date, next due date, frequency, primary account, status & related status", function() {
				scheduleEditController.useLastTransaction(transaction);
				(undefined === transaction.id).should.be.true;
				(undefined === transaction.transaction_date).should.be.true;
				(undefined === transaction.next_due_date).should.be.true;
				(undefined === transaction.frequency).should.be.true;
				(undefined === transaction.primary_account).should.be.true;
				(undefined === transaction.status).should.be.true;
				(undefined === transaction.related_status).should.be.true;
			});

			it("should preserve the schedule's flag", function() {
				var flag = "schedule flag";
				scheduleEditController.transaction.flag = flag;
				scheduleEditController.useLastTransaction(transaction);
				scheduleEditController.transaction.flag.should.equal(flag);
			});

			it("should ignore the previous transaction's flag", function() {
				scheduleEditController.transaction.flag = undefined;
				scheduleEditController.useLastTransaction(transaction);
				(undefined === scheduleEditController.transaction.flag).should.be.true;
			});

			it("should merge the transaction details into vm.transaction", function() {
				transaction.category = "original category";
				scheduleEditController.useLastTransaction(transaction);
				scheduleEditController.transaction.should.deep.equal(transaction);
			});

			it("should retrigger the amount focus handler if focussed", function() {
				currentElement = document.activeElement;
				scheduleEditController.useLastTransaction(transaction);
				$timeout.flush();
				mockJQueryInstance.triggerHandler.should.have.been.calledWith("focus");
			});

			it("should not retrigger the amount focus handler if not focussed", function() {
				scheduleEditController.useLastTransaction(transaction);
				mockJQueryInstance.triggerHandler.should.not.have.been.called;
			});

			afterEach(function() {
				$timeout.verifyNoPendingTasks();
			});
		});

		describe("categorySelected", function() {
			describe("(main transaction)", function() {
				beforeEach(function() {
					scheduleEditController.transaction.category = {direction: "inflow"};
				});

				var scenarios = [
					{id: "TransferTo", type: "Transfer", direction: "outflow"},
					{id: "TransferFrom", type: "Transfer", direction: "inflow"},
					{id: "SplitTo", type: "Split", direction: "outflow", subtransactions: true},
					{id: "SplitFrom", type: "Split", direction: "inflow", subtransactions: true},
					{id: "Payslip", type: "Payslip", direction: "inflow", subtransactions: true},
					{id: "LoanRepayment", type: "LoanRepayment", direction: "outflow", subtransactions: true},
					{id: "anything else", type: "Basic", direction: "the category direction"},
				];

				scenarios.forEach(function(scenario) {
					var subtransactions,
							memo = "test memo",
							amount = 123;

					it("should set the transaction type to " + scenario.type + " and the direction to " + scenario.direction + " if the category is " + scenario.id, function() {
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
						it("should not create any stub subtransactions for a " + scenario.id + " if some already exist", function() {
							subtransactions = "existing subtransactions";
							scheduleEditController.transaction.category.id = scenario.id;
							scheduleEditController.transaction.subtransactions = subtransactions;
							scheduleEditController.categorySelected();
							scheduleEditController.transaction.subtransactions.should.equal(subtransactions);
						});

						it("should create four stub subtransactions for a " + scenario.id + " if none exist", function() {
							subtransactions = [{memo: memo, amount: amount}, {}, {}, {}];
							scheduleEditController.transaction.category.id = scenario.id;
							scheduleEditController.transaction.subtransactions = undefined;
							scheduleEditController.transaction.memo = memo;
							scheduleEditController.transaction.amount = amount;
							scheduleEditController.categorySelected();
							scheduleEditController.transaction.subtransactions.should.deep.equal(subtransactions);
						});
					}
				});

				it("should set the transaction type to Basic if the selected category is not an existing category", function() {
					scheduleEditController.transaction.category = "new category";
					scheduleEditController.categorySelected();
					scheduleEditController.transaction.transaction_type.should.equal("Basic");
				});
			});

			describe("(subtransaction)", function() {
				beforeEach(function() {
					scheduleEditController.transaction.subtransactions = [
						{category: {direction: "inflow"}}
					];
				});

				var scenarios = [
					{id: "TransferTo", type: "Subtransfer", direction: "outflow"},
					{id: "TransferFrom", type: "Subtransfer", direction: "inflow"},
					{id: "anything else", type: "Sub", direction: "the category direction"},
				];

				scenarios.forEach(function(scenario) {
					it("should set the transaction type to " + scenario.type + " and the direction to " + scenario.direction + " if the category is " + scenario.id, function() {
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

				it("should set the transaction type to Sub if the selected category is not an existing category", function() {
					scheduleEditController.transaction.subtransactions[0].category = "new category";
					scheduleEditController.categorySelected(0);
					scheduleEditController.transaction.subtransactions[0].transaction_type.should.equal("Sub");
				});
			});

			it("should set the direction to outflow if the selected category is not an existing category", function() {
				scheduleEditController.categorySelected();
				scheduleEditController.transaction.direction.should.equal("outflow");
			});

			it("should clear the subcategory if it's parent no longer matches the selected category", function() {
				scheduleEditController.transaction.subcategory = {
					parent_id: 1
				};
				scheduleEditController.categorySelected();
				(null === scheduleEditController.transaction.subcategory).should.be.true;
			});
		});

		describe("investmentCategorySelected", function() {
			beforeEach(function() {
				scheduleEditController.transaction.category = {};
			});

			it("should do nothing if the selected category is not an existing category", function() {
				var transaction_type = "transaction type",
						direction = "direction";

				scheduleEditController.transaction.category = "new category";
				scheduleEditController.transaction.transaction_type = transaction_type;
				scheduleEditController.transaction.direction = direction;
				scheduleEditController.investmentCategorySelected();
				scheduleEditController.transaction.transaction_type.should.equal(transaction_type);
				scheduleEditController.transaction.direction.should.equal(direction);
			});

			var scenarios = [
				{id: "TransferTo", type: "SecurityTransfer", direction: "outflow"},
				{id: "TransferFrom", type: "SecurityTransfer", direction: "inflow"},
				{id: "RemoveShares", type: "SecurityHolding", direction: "outflow"},
				{id: "AddShares", type: "SecurityHolding", direction: "inflow"},
				{id: "Sell", type: "SecurityInvestment", direction: "outflow"},
				{id: "Buy", type: "SecurityInvestment", direction: "inflow"},
				{id: "DividendTo", type: "Dividend", direction: "outflow"},
			];

			scenarios.forEach(function(scenario) {
				it("should set the transaction type to " + scenario.type + " and the direction to " + scenario.direction + " if the category is " + scenario.id, function() {
					scheduleEditController.transaction.category.id = scenario.id;
					scheduleEditController.investmentCategorySelected();
					scheduleEditController.transaction.transaction_type.should.equal(scenario.type);
					scheduleEditController.transaction.direction.should.equal(scenario.direction);
				});
			});
		});

		describe("primaryAccountSelected", function() {
			var account_type;

			beforeEach(function() {
				account_type = "new account type";
				scheduleEditController.transaction.primary_account = {id: 1, account_type: account_type};
			});

			it("should clear the category and subcategory if the account type no longer matches the primary account type", function() {
				scheduleEditController.account_type = "old account type";
				scheduleEditController.primaryAccountSelected();
				(null === scheduleEditController.transaction.category).should.be.true;
				(null === scheduleEditController.transaction.subcategory).should.be.true;
			});
			
			it("should set the account type to the primary account type", function() {
				scheduleEditController.primaryAccountSelected();
				scheduleEditController.account_type.should.equal("new account type");
			});

			it("should clear the transfer account when the primary account matches", function() {
				scheduleEditController.transaction.account = {id: 1};
				scheduleEditController.primaryAccountSelected();
				(null === scheduleEditController.transaction.account).should.be.true;
			});
		});

		describe("$watch subtransations", function() {
			var subtransactions;

			beforeEach(function() {
				subtransactions = [
					{amount: 10, direction: "outflow"},
					{amount: 5, direction: "inflow"},
					{}
				];
				sinon.stub(scheduleEditController, "memoFromSubtransactions");

				scheduleEditController.transaction.direction = "outflow";
				scheduleEditController.transaction.subtransactions = [{},{}];
				scheduleEditController.$scope.$digest();
			});

			it("should do nothing if the watched value hasn't changed", function() {
				scheduleEditController.$scope.$digest();
				(undefined === scheduleEditController.totalAllocated).should.be.true;
			});
				
			it("should do nothing if there are no subtransactions", function() {
				scheduleEditController.transaction.subtransactions = undefined;
				scheduleEditController.$scope.$digest();
				(undefined === scheduleEditController.totalAllocated).should.be.true;
			});

			it("should calculate the total and make it available to the view", function() {
				scheduleEditController.transaction.subtransactions = subtransactions;
				scheduleEditController.$scope.$digest();
				scheduleEditController.totalAllocated.should.equal(5);
			});

			it("should not set the main transaction memo when editing an existing transaction", function() {
				scheduleEditController.transaction.id = 1;
				scheduleEditController.transaction.subtransactions = subtransactions;
				scheduleEditController.$scope.$digest();
				scheduleEditController.memoFromSubtransactions.should.not.have.been.called;
			});

			it("should set the main transaction memo when adding a new transaction", function() {
				scheduleEditController.transaction.subtransactions = subtransactions;
				scheduleEditController.$scope.$digest();
				scheduleEditController.memoFromSubtransactions.should.have.been.called;
			});
		});

		describe("memoFromSubtransactions", function() {
			var memo;

			beforeEach(function() {
				memo = "memo";
				scheduleEditController.transaction.memo = memo;
				scheduleEditController.transaction.subtransactions = [
					{memo: "memo 1"},
					{memo: "memo 2"},
					{}
				];
			});

			it("should join the sub transaction memos and set the main transaction memo when adding a new transaction", function() {
				scheduleEditController.memoFromSubtransactions();
				scheduleEditController.transaction.memo.should.equal("memo 1; memo 2");
			});
		});

		describe("primaryAccounts", function() {
			var accounts;

			beforeEach(function() {
				accounts = scheduleEditController.primaryAccounts("a", 3);
			});

			it("should fetch the list of accounts", function() {
				accountModel.all.should.have.been.called;
			});

			it("should return a filtered & limited list of accounts", function() {
				accounts.should.eventually.deep.equal([
					{id: 1, name: "aa"},
					{id: 4, name: "ba"},
					{id: 5, name: "ab"}
				]);
			});
		});

		describe("accounts", function() {
			var accounts;

			it("should fetch the list of accounts", function() {
				scheduleEditController.accounts();
				accountModel.all.should.have.been.called;
			});

			it("should remove the current account from the list", function() {
				scheduleEditController.transaction.primary_account = {name: "aa"};
				accounts = scheduleEditController.accounts("a", 2);
				accounts.should.eventually.deep.equal([
					{id: 4, name: "ba"},
					{id: 5, name: "ab"}
				]);
			});

			it("should return a filtered & limited list of non-investment accounts when the transaction type is not Security Transfer", function() {
				accounts = scheduleEditController.accounts("b", 2);
				accounts.should.eventually.deep.equal([
					{id: 4, name: "ba"},
					{id: 5, name: "ab"}
				]);
			});

			it("should return a filtered & limited list of investment accounts when the transaction type is Security Transfer", function() {
				scheduleEditController.transaction.transaction_type = "SecurityTransfer";
				accounts = scheduleEditController.accounts("b", 2);
				accounts.should.eventually.deep.equal([
					{id: 2, name: "bb", account_type: "investment"},
					{id: 6, name: "bc", account_type: "investment"}
				]);
			});
		});

		describe("frequencies", function() {
			it("should return a filtered & limited list of frequencies", function() {
				scheduleEditController.frequencies("t", 2).should.deep.equal(["Fortnightly", "Monthly"]);
			});
		});

		describe("addSubtransaction", function() {
			it("should add an empty object to the subtransactions array", function() {
				scheduleEditController.transaction.subtransactions = [];
				scheduleEditController.addSubtransaction();
				scheduleEditController.transaction.subtransactions.should.deep.equal([{}]);
			});
		});

		describe("deleteSubtransaction", function() {
			it("should remove an item from the subtransactions array at the specified index", function() {
				scheduleEditController.transaction.subtransactions = [1, 2, 3];
				scheduleEditController.deleteSubtransaction(1);
				scheduleEditController.transaction.subtransactions.should.deep.equal([1, 3]);
			});
		});

		describe("addUnallocatedAmount", function() {
			beforeEach(function() {
				scheduleEditController.transaction.amount = 100;
				scheduleEditController.totalAllocated = 80;
				scheduleEditController.transaction.subtransactions = [
					{amount: 80},
					{amount: undefined}
				];
			});

			it("should increase an existing subtransaction amount by the unallocated amount", function() {
				scheduleEditController.addUnallocatedAmount(0);
				scheduleEditController.transaction.subtransactions[0].amount.should.equal(100);
			});

			it("should set a blank subtransacion amount to the unallocated amount", function() {
				scheduleEditController.addUnallocatedAmount(1);
				scheduleEditController.transaction.subtransactions[1].amount.should.equal(20);
			});
		});

		describe("calculateNextDue", function() {
			var scenarios = [
				{frequency: "Weekly", period: "weeks", amount: 1},
				{frequency: "Fortnightly", period: "weeks", amount: 2},
				{frequency: "Monthly", period: "month", amount: 1},
				{frequency: "Bimonthly", period: "month", amount: 2},
				{frequency: "Quarterly", period: "months", amount: 3},
				{frequency: "Yearly", period: "year", amount: 1}
			];

			scenarios.forEach(function(scenario) {
				it("should add " + scenario.amount + " " + scenario.period + " to the next due date when the frequency is " + scenario.frequency, function() {
					var next_due_date = scheduleEditController.schedule.next_due_date;
					scheduleEditController.schedule.frequency = scenario.frequency;
					scheduleEditController.calculateNextDue();
					scheduleEditController.schedule.next_due_date.should.deep.equal(moment(next_due_date).add(scenario.amount, scenario.period).toDate());
				});
			});

			it("should decrement the overdue count when greater than zero", function() {
				scheduleEditController.schedule.overdue_count = 1;
				scheduleEditController.calculateNextDue();
				scheduleEditController.schedule.overdue_count.should.equal(0);
			});

			it("should leave the overdue account unchanged when zero", function() {
				scheduleEditController.schedule.overdue_count = 0;
				scheduleEditController.calculateNextDue();
				scheduleEditController.schedule.overdue_count.should.equal(0);
			});
		});

		describe("updateInvestmentDetails", function() {
			var amount,
					memo;

			beforeEach(function() {
				amount = 100;
				memo = "memo";
				scheduleEditController.transaction.id = undefined;
				scheduleEditController.transaction.transaction_type = "SecurityInvestment";
				scheduleEditController.transaction.quantity = 2;
				scheduleEditController.transaction.price = 10;
				scheduleEditController.transaction.commission = 1;
				scheduleEditController.transaction.amount = amount;
				scheduleEditController.transaction.memo = memo;
			});

			it("should do nothing when the transaction type is not SecurityInvestment", function() {
				scheduleEditController.transaction.transaction_type = undefined;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.amount.should.equal(amount);
				scheduleEditController.transaction.memo.should.equal(memo);
			});

			it("should set the transaction amount to zero and the memo to an empty string if the price, quantity and commission are not specified for Security Investment transactions", function() {
				scheduleEditController.transaction.quantity = undefined;
				scheduleEditController.transaction.price = undefined;
				scheduleEditController.transaction.commission = undefined;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.amount.should.equal(0);
				scheduleEditController.transaction.memo.should.be.empty;
			});

			it("should calculate the transaction amount from the price, quantity and commission for Security Investment transactions", function() {
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.amount.should.equal(19);
			});

			it("should not update the memo when editing an existing Security Investment transaction", function() {
				scheduleEditController.transaction.id = 1;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.memo.should.equal(memo);
			});

			it("should update the memo with the price, quantity and commission when adding a new Security Investment transaction", function() {
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.memo.should.equal("2 @ $10.00 (less $1.00 commission)");
			});
		});

		describe("edit", function() {
			beforeEach(function() {
				scheduleEditController.edit();
			});

			it("should set the mode to Edit Schedule", function() {
				scheduleEditController.mode.should.equal("Edit Schedule");
			});

			it("should set the transaction to the schedule", function() {
				scheduleEditController.transaction.should.equal(scheduleEditController.schedule);
			});
		});

		describe("enter", function() {
			beforeEach(function() {
				sinon.stub(scheduleEditController, "skip");
				scheduleEditController.transaction.id = 1;
			});

			it("should reset any previous error messages", function() {
				scheduleEditController.errorMessage = "error message";
				scheduleEditController.enter();
				(null === scheduleEditController.errorMessage).should.be.true;
			});

			it("should save the schedule", function() {
				scheduleEditController.enter();
				transactionModel.save.should.have.been.calledWith(scheduleEditController.transaction);
			});

			it("should update the next due date when the transaction save is successful", function() {
				scheduleEditController.enter();
				scheduleEditController.skip.should.have.been.called;
			});

			it("should display an error message when the transaction save is unsuccessful", function() {
				scheduleEditController.transaction.id = -1;
				scheduleEditController.enter();
				scheduleEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("skip", function() {
			beforeEach(function() {
				sinon.stub(scheduleEditController, "calculateNextDue");
				sinon.stub(scheduleEditController, "save");
				scheduleEditController.skip();
			});

			it("should calculate the next due date", function() {
				scheduleEditController.calculateNextDue.should.have.been.called;
			});

			it("should save the schedule", function() {
				scheduleEditController.save.should.have.been.calledWith(true);
			});
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				scheduleEditController.errorMessage = "error message";
				scheduleEditController.save();
				(null === scheduleEditController.errorMessage).should.be.true;
			});

			it("should set the flag memo to '(no memo)' if the auto-flag property is set and the memo is blank", function() {
				scheduleEditController.schedule.autoFlag = true;
				scheduleEditController.save();
				scheduleEditController.schedule.flag.should.equal("(no memo)");
			});

			it("should set the flag to null if the auto-flag property is not set", function() {
				scheduleEditController.schedule.flag = "Test flag";
				scheduleEditController.save();
				(null === scheduleEditController.schedule.flag).should.be.true;
			});

			it("should save the schedule", function() {
				scheduleEditController.save();
				scheduleModel.save.should.have.been.calledWith(schedule);
			});

			it("should close the modal when the schedule save is successful", function() {
				scheduleEditController.save();
				$modalInstance.close.should.have.been.calledWith({data: schedule, skipped: false});
			});

			it("should mark the schedule as skipped when the skipped parameter is true", function() {
				scheduleEditController.save(true);
				$modalInstance.close.should.have.been.calledWith({data: schedule, skipped: true});
			});

			it("should display an error message when the schedule save is unsuccessful", function() {
				scheduleEditController.schedule.id = -1;
				scheduleEditController.save();
				scheduleEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				scheduleEditController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
