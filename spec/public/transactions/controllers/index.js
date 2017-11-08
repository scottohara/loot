import {addDays, startOfDay, subDays} from "date-fns/esm";
import angular from "angular";

describe("TransactionIndexController", () => {
	let	transactionIndexController,
			controllerTest,
			$transitions,
			$uibModal,
			$timeout,
			$window,
			$state,
			transactionModel,
			accountModel,
			ogTableNavigableService,
			ogViewScrollService,
			contextModel,
			context,
			transactionBatch,
			deregisterTransitionSuccessHook;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootTransactions", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModal", "$window", "$state", "transactionModel", "accountModel", "contextModel", "context", "transactionBatch"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$transitions_, _$uibModal_, _$timeout_, _$window_, _$state_, _transactionModel_, _accountModel_, _ogTableNavigableService_, _ogViewScrollService_, _contextModel_, _context_, _transactionBatch_) => {
		controllerTest = _controllerTest_;
		$transitions = _$transitions_;
		$uibModal = _$uibModal_;
		$timeout = _$timeout_;
		$window = _$window_;
		$state = _$state_;
		transactionModel = _transactionModel_;
		accountModel = _accountModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		ogViewScrollService = _ogViewScrollService_;
		contextModel = _contextModel_;
		context = _context_;
		transactionBatch = _transactionBatch_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		sinon.stub(ogViewScrollService, "scrollTo");
		transactionIndexController = controllerTest("TransactionIndexController");
	}));

	it("should make the passed context available to the view", () => transactionIndexController.context.should.deep.equal(context));

	it("should make the passed context type available to the view", () => transactionIndexController.contextType.should.equal(contextModel.type));

	it("should not set a context type when a context model was not specified", () => {
		transactionIndexController = controllerTest("TransactionIndexController", {contextModel: null});
		(!transactionIndexController.contextType).should.be.true;
	});

	it("should fetch the show all details setting", () => transactionModel.allDetailsShown.should.have.been.called);

	it("should make today's date available to the view", () => transactionIndexController.today.should.deep.equal(startOfDay(new Date())));

	it("should set an empty array of transactions to the view", () => {
		transactionIndexController = controllerTest("TransactionIndexController", {transactionBatch: {transactions: {length: 0}}});
		transactionIndexController.transactions.should.be.an.Array;
		transactionIndexController.transactions.should.be.empty;
	});

	it("should process the passed transaction batch", () => (transactionIndexController.openingBalance = transactionBatch.openingBalance));

	it("should ensure the transaction is focussed when the transaction id state param is present", () => {
		$state.params.transactionId = "1";
		transactionIndexController = controllerTest("TransactionIndexController", {$state});
		transactionIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		transactionIndexController.tableActions.focusRow.should.have.been.calledWith(0);
	});

	it("should set the previous/next loading indicators to false", () => {
		transactionIndexController.loading.prev.should.be.false;
		transactionIndexController.loading.next.should.be.false;
	});

	it("should register a success transition hook", () => $transitions.onSuccess.should.have.been.calledWith({to: "**.transactions.transaction"}, sinon.match.func));

	it("should deregister the success transition hook when the scope is destroyed", () => {
		transactionIndexController.$scope.$emit("$destroy");
		deregisterTransitionSuccessHook.should.have.been.called;
	});

	it("should ensure the transaction is focussed when the transaction id state param changes", () => {
		const toParams = {transactionId: "1"};

		sinon.stub(transactionIndexController, "transitionSuccessHandler");
		$transitions.onSuccess.firstCall.args[1]({params: sinon.stub().withArgs("to").returns(toParams)});
		transactionIndexController.transitionSuccessHandler.should.have.been.calledWith(Number(toParams.transactionId));
	});

	it("should scroll to the bottom when the controller loads", () => {
		$timeout.flush();
		ogViewScrollService.scrollTo.should.have.been.calledWith("bottom");
	});

	describe("editTransaction", () => {
		let	transaction,
				contextChangedStub;

		beforeEach(() => {
			contextChangedStub = sinon.stub(transactionIndexController, "contextChanged");
			sinon.stub(transactionIndexController, "updateClosingBalance");
			sinon.stub(transactionIndexController, "getTransactions");
			sinon.stub(transactionIndexController, "updateRunningBalances");
			sinon.stub(transactionIndexController, "focusTransaction");
			transaction = angular.copy(transactionIndexController.transactions[1]);
		});

		it("should disable navigation on the table", () => {
			transactionIndexController.editTransaction();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", () => {
			it("should do nothing if the transaction can't be edited", () => {
				sinon.stub(transactionIndexController, "isAllowed").returns(false);
				transactionIndexController.editTransaction(1);
				Boolean(ogTableNavigableService.enabled).should.be.true;
				$uibModal.open.should.not.have.been.called;
			});

			it("should open the edit transaction modal with a transaction", () => {
				transactionIndexController.editTransaction(1);
				$uibModal.open.should.have.been.called;
				$uibModal.resolves.transaction.should.deep.equal(transaction);
				transactionModel.findSubtransactions.should.not.have.been.called;
			});

			const scenarios = ["Split", "LoanRepayment", "Payslip"];

			scenarios.forEach(scenario => {
				it(`should prefetch the subtransactions for a ${scenario} transaction`, () => {
					transactionIndexController.transactions[1].transaction_type = scenario;
					transactionIndexController.editTransaction(1);
					transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
					$uibModal.resolves.transaction.should.eventually.have.a.property("subtransactions");
				});
			});

			it("should update the closing balance when the modal is closed", () => {
				const originalTransaction = angular.copy(transaction);

				transaction.memo = "edited transaction";
				transactionIndexController.editTransaction(1);
				$uibModal.close(transaction);
				transactionIndexController.updateClosingBalance.should.have.been.calledWith(originalTransaction, transaction);
			});

			it("should update the transaction in the list of transactions when the modal is closed", () => {
				transaction.memo = "edited transaction";
				transactionIndexController.editTransaction(1);
				$uibModal.close(transaction);
				transactionIndexController.transactions.should.include(transaction);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				transaction = {
					transaction_type: "Basic",
					transaction_date: startOfDay(new Date()),
					primary_account: null,
					payee: null,
					security: null,
					category: null,
					subcategory: null
				};
			});

			describe("(default values)", () => {
				beforeEach(() => {
					transactionModel.lastTransactionDate = subDays(startOfDay(new Date()), 1);
					transaction.transaction_date = transactionModel.lastTransactionDate;
				});

				it("should open the edit transaction modal with a default primary account if the context type is account", () => {
					transactionIndexController.contextType = "account";
					transactionIndexController.context = "test account";
					transaction.primary_account = transactionIndexController.context;
				});

				it("should open the edit transaction modal with a default payee if the context type is payee", () => {
					transactionIndexController.contextType = "payee";
					transactionIndexController.context = "test payee";
					transaction.payee = transactionIndexController.context;
				});

				it("should open the edit transaction modal with a default security if the context type is security", () => {
					transactionIndexController.contextType = "security";
					transactionIndexController.context = "test security";
					transaction.security = transactionIndexController.context;
				});

				it("should open the edit transaction modal with a default category if the context type is category and the context is a category", () => {
					transactionIndexController.contextType = "category";
					transactionIndexController.context = "test category";
					transaction.category = transactionIndexController.context;
				});

				it("should open the edit transaction modal with a default category and subcategory if the context type is category and the context is a subcategory", () => {
					transactionIndexController.contextType = "category";
					transactionIndexController.context = {id: "test subcategory", parent: "test category"};
					transaction.category = "test category";
					transaction.subcategory = transactionIndexController.context;
				});

				afterEach(() => {
					transactionIndexController.editTransaction();
					$uibModal.open.should.have.been.called;
					$uibModal.resolves.transaction.should.deep.equal(transaction);
				});
			});

			it("should update the closing balance when the modal is closed", () => {
				// No original transaction, leave uninitialised
				let originalTransaction;

				transactionIndexController.editTransaction();
				$uibModal.close(transaction);
				transactionIndexController.updateClosingBalance.should.have.been.calledWith(originalTransaction, transaction);
			});

			it("should add the new transaction to the list of transactions when the modal is closed", () => {
				transaction.payee = context;
				transactionIndexController.editTransaction();
				$uibModal.close(transaction);
				transactionIndexController.transactions.pop().should.deep.equal(transaction);
			});
		});

		it("should check if the context has changed when the modal is closed", () => {
			transactionIndexController.editTransaction(1);
			$uibModal.close(transaction);
			transactionIndexController.contextChanged.should.have.been.calledWith(transaction);
		});

		describe("(on context changed)", () => {
			beforeEach(() => {
				contextChangedStub.returns(true);
				sinon.stub(transactionIndexController, "removeTransaction");
				transactionIndexController.editTransaction(1);
			});

			it("should remove the transaction from the list of transactions", () => {
				$uibModal.close(transaction);
				transactionIndexController.removeTransaction.should.have.been.calledWith(1);
			});
		});

		describe("(transaction date is before the current batch", () => {
			it("should fetch a new transaction batch starting from the new transaction date", () => {
				transaction.transaction_date = subDays(transactionIndexController.firstTransactionDate, 1);
				transactionIndexController.editTransaction(1);
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.have.been.calledWith("next", subDays(transaction.transaction_date, 1), transaction.id);
			});
		});

		describe("(transaction date is after the current batch", () => {
			beforeEach(() => {
				transaction.transaction_date = addDays(transactionIndexController.lastTransactionDate, 1);
				transactionIndexController.editTransaction(1);
			});

			it("should not fetch a new transaction batch if we're already at the end", () => {
				transactionIndexController.atEnd = true;
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.not.have.been.called;
			});

			it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", () => {
				transactionIndexController.atEnd = false;
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.have.been.calledWith("prev", addDays(transaction.transaction_date, 1), transaction.id);
			});
		});

		describe("transaction date is within the current batch, or we're at the end", () => {
			it("should not fetch a new transaction batch when the modal is closed", () => {
				transactionIndexController.editTransaction(1);
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.not.have.been.called;
			});

			it("should resort the transaction list when the modal is closed", () => {
				transaction.id = 999;
				transaction.transaction_date = subDays(startOfDay(new Date()), 1);
				transactionIndexController.editTransaction(1);
				$uibModal.close(transaction);
				transactionIndexController.transactions.pop().should.deep.equal(transaction);
			});

			it("should recalculate the running balances when the modal is closed", () => {
				transactionIndexController.editTransaction();
				$uibModal.close(transaction);
				transactionIndexController.updateRunningBalances.should.have.been.called;
			});

			it("should focus the transaction when the modal is closed", () => {
				transactionIndexController.editTransaction();
				$uibModal.close(transaction);
				transactionIndexController.focusTransaction.should.have.been.calledWith(transaction.id);
			});
		});

		it("should not change the transactions list when the modal is dismissed", () => {
			const originalTransactions = angular.copy(transactionIndexController.transactions);

			transactionIndexController.editTransaction();
			$uibModal.dismiss();
			transactionIndexController.transactions.should.deep.equal(originalTransactions);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			transactionIndexController.editTransaction();
			$uibModal.close(transaction);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			transactionIndexController.editTransaction();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("contextChanged", () => {
		let transaction;

		beforeEach(() => (transaction = angular.copy(transactionIndexController.transactions[1])));

		describe("(search mode)", () => {
			beforeEach(() => {
				transactionIndexController.contextType = null;
				transactionIndexController.context = "Search";
			});

			it("should return true when the transaction memo no longer contains the search query", () => {
				transaction.memo = "test memo";
				transactionIndexController.contextChanged(transaction).should.be.true;
			});

			it("should return false when the transaction memo contains the search query", () => {
				transaction.memo = "test search";
				transactionIndexController.contextChanged(transaction).should.be.false;
			});
		});

		describe("(context mode)", () => {
			const scenarios = [
				{type: "account", field: "primary_account", context: {id: "test primary account"}},
				{type: "payee", field: "payee", context: {id: "test payee"}},
				{type: "security", field: "security", context: {id: "test security"}},
				{type: "category", field: "category", context: {id: "test category"}},
				{type: "category", field: "subcategory", context: {id: "test subcategory", parent: "test category"}}
			];

			angular.forEach(scenarios, scenario => {
				it(`should return true when the context type is ${scenario.type} and the transaction ${scenario.field} no longer matches the context`, () => {
					transactionIndexController.contextType = scenario.type;
					transactionIndexController.context = scenario.context;
					transaction[scenario.field] = {id: "edited"};
					transactionIndexController.contextChanged(transaction).should.be.true;
				});

				it(`should return false when the context type is ${scenario.type} and the transaction ${scenario.field} matches the context`, () => {
					transactionIndexController.contextType = scenario.type;
					transactionIndexController.context = scenario.context;
					transaction[scenario.field] = scenario.context;
					transactionIndexController.contextChanged(transaction).should.be.false;
				});
			});
		});
	});

	describe("deleteTransaction", () => {
		let transaction;

		beforeEach(() => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			sinon.stub(transactionIndexController, "removeTransaction");
		});

		it("should do nothing if the transaction can't be deleted", () => {
			sinon.stub(transactionIndexController, "isAllowed").returns(false);
			transactionIndexController.deleteTransaction(1);
			Boolean(ogTableNavigableService.enabled).should.be.true;
			$uibModal.open.should.not.have.been.called;
		});

		it("should disable navigation on the table", () => {
			transactionIndexController.deleteTransaction(1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should open the delete transaction modal with a transaction", () => {
			transactionIndexController.deleteTransaction(1);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.transaction.should.deep.equal(transaction);
		});

		it("should remove the transaction from the transactions list when the modal is closed", () => {
			transactionIndexController.deleteTransaction(1);
			$uibModal.close(transaction);
			transactionIndexController.removeTransaction.should.have.been.calledWith(1);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			transactionIndexController.deleteTransaction(1);
			$uibModal.close(transaction);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			transactionIndexController.deleteTransaction(1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("removeTransaction", () => {
		let transaction;

		beforeEach(() => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			sinon.stub(transactionIndexController, "updateClosingBalance");
		});

		it("should update the closing balance if the transaction was not focussed", () => {
			transactionIndexController.removeTransaction(1);
			transactionIndexController.updateClosingBalance.should.have.been.calledWith(transaction);
		});

		it("should remove the transaction from the transactions list", () => {
			transactionIndexController.removeTransaction(1);
			transactionIndexController.transactions.should.not.include(transaction);
		});

		it("should transition to the parent state if the transaction was focussed", () => {
			$state.currentState("**.transaction");
			transactionIndexController.removeTransaction(1);
			$state.go.should.have.been.calledWith("^");
		});
	});

	describe("updateClosingBalance", () => {
		it("should do nothing if the context doesn't have a closing balance property", () => {
			transactionIndexController.context = "search";
			transactionIndexController.updateClosingBalance({amount: 1});
			transactionIndexController.should.not.have.a.property("closing_balance");
		});

		describe("(context has a closing balance property)", () => {
			let	transaction,
					expected;

			beforeEach(() => {
				transaction = {
					amount: 1
				};
				transactionIndexController.context.closing_balance = 0;
			});

			describe("(original transaction)", () => {
				it("should do nothing if undefined", () => {
					transaction = null;
					expected = 0;
				});

				it("should reduce the closing balance by the transaction amount when the direction is inflow", () => {
					transaction.direction = "inflow";
					expected = -1;
				});

				it("should increase the closing balance by the transaction amount when the direction is outflow", () => {
					transaction.direction = "outflow";
					expected = 1;
				});

				afterEach(() => transactionIndexController.updateClosingBalance(transaction));
			});

			describe("(new transaction)", () => {
				it("should do nothing if undefined", () => {
					transaction = null;
					expected = 0;
				});

				it("should increase the closing balance by the transaction amount when the direction is inflow", () => {
					transaction.direction = "inflow";
					expected = 1;
				});

				it("should reduce the closing balance by the transaction amount when the direction is outflow", () => {
					transaction.direction = "outflow";
					expected = -1;
				});

				afterEach(() => transactionIndexController.updateClosingBalance(null, transaction));
			});

			afterEach(() => transactionIndexController.context.closing_balance.should.equal(expected));
		});
	});

	describe("isAllowed", () => {
		let transaction;

		beforeEach(() => {
			sinon.stub(transactionIndexController, "promptToSwitchAccounts");
			transaction = angular.copy(transactionIndexController.transactions[1]);
			transaction.primary_account = {account_type: "bank"};
		});

		describe("(not allowed)", () => {
			const scenarios = [
				{action: "edit", type: "Sub", message: "This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?"},
				{action: "delete", type: "Sub", message: "This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?"},
				{action: "edit", type: "Subtransfer", message: "This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?"},
				{action: "delete", type: "Subtransfer", message: "This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?"},
				{action: "edit", type: "Dividend", message: "This is an investment transaction. You can only edit it from the investment account. Would you like to switch to the investment account now?"},
				{action: "edit", type: "SecurityInvestment", message: "This is an investment transaction. You can only edit it from the investment account. Would you like to switch to the investment account now?"}
			];

			angular.forEach(scenarios, scenario => {
				it(`should prompt to switch accounts when attempting to ${scenario.action} a ${scenario.type} transaction`, () => {
					transaction.transaction_type = scenario.type;
					transactionIndexController.isAllowed(scenario.action, transaction);
					transactionIndexController.promptToSwitchAccounts.should.have.been.calledWith(scenario.message, transaction);
				});

				it(`should return false when attempting to ${scenario.action} a ${scenario.type} transaction`, () => {
					transaction.transaction_type = scenario.type;
					transactionIndexController.isAllowed(scenario.action, transaction).should.be.false;
				});
			});
		});

		describe("(allowed)", () => {
			const scenarios = [
				{action: "edit", type: "Basic"},
				{action: "delete", type: "Basic"},
				{action: "edit", type: "Dividend", account_type: "investment"},
				{action: "delete", type: "Dividend"},
				{action: "edit", type: "SecurityInvestment", account_type: "investment"},
				{action: "delete", type: "SecurityInvestment"}
			];

			angular.forEach(scenarios, scenario => {
				it(`should not prompt to switch accounts when attempting to ${scenario.action} a ${scenario.type} transaction${scenario.account_type ? ` from an ${scenario.account_type} acount` : ""}`, () => {
					transaction.transaction_type = scenario.type;
					transaction.primary_account.account_type = scenario.account_type || transaction.primary_account.account_type;
					transactionIndexController.isAllowed(scenario.action, transaction);
					transactionIndexController.promptToSwitchAccounts.should.not.have.been.called;
				});

				it(`should return true when attempting to ${scenario.action} a ${scenario.type} transaction${scenario.account_type ? ` from an ${scenario.account_type} acount` : ""}`, () => {
					transaction.transaction_type = scenario.type;
					transaction.primary_account.account_type = scenario.account_type || transaction.primary_account.account_type;
					transactionIndexController.isAllowed(scenario.action, transaction).should.be.true;
				});
			});
		});
	});

	describe("promptToSwitchAccounts", () => {
		let	message,
				transaction;

		beforeEach(() => {
			sinon.stub(transactionIndexController, "switchAccount");
			sinon.stub(transactionIndexController, "switchPrimaryAccount");
			message = "test message";
			transaction = angular.copy(transactionIndexController.transactions[1]);
			transaction.account = {id: "account"};
			transaction.primary_account = {id: "primary account"};
			transactionIndexController.promptToSwitchAccounts(message, transaction);
		});

		it("should disable navigation on the table", () => ogTableNavigableService.enabled.should.be.false);

		it("should prompt the user to switch to the other account", () => {
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.confirm.message.should.equal(message);
		});

		it("should switch to the other account when the modal is closed", () => {
			$uibModal.close();
			transactionIndexController.switchAccount.should.have.been.calledWith(null, transaction);
		});

		it("should switch to the primary account if there is no other account when the modal is closed", () => {
			transaction.account = null;
			$uibModal.close();
			transactionIndexController.switchPrimaryAccount.should.have.been.calledWith(null, transaction);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			$uibModal.close();
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dismissed", () => {
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("tableActions.selectAction", () => {
		describe("(not reconciling)", () => {
			it("should edit a transaction", () => {
				sinon.stub(transactionIndexController, "editTransaction");
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.editTransaction.should.have.been.calledWith(1);
			});
		});

		describe("(reconciling)", () => {
			beforeEach(() => {
				transactionIndexController = controllerTest("TransactionIndexController", {contextModel: accountModel});
				transactionIndexController.reconciling = true;
				sinon.stub(transactionIndexController, "toggleCleared");
			});

			it("should set the transaction status to Cleared if not already", () => {
				transactionIndexController.transactions[1].status = "";
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.transactions[1].status.should.equal("Cleared");
			});

			it("should clear the transaction status if set to Cleared", () => {
				transactionIndexController.transactions[1].status = "Cleared";
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.transactions[1].status.should.equal("");
			});

			it("should toggle the transaction's cleared status", () => {
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.toggleCleared.should.have.been.calledWith(transactionIndexController.transactions[1]);
			});
		});
	});

	describe("tableActions.editAction", () => {
		it("should edit the transaction", () => {
			sinon.stub(transactionIndexController, "editTransaction");
			transactionIndexController.tableActions.editAction(1);
			transactionIndexController.editTransaction.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", () => {
		it("should insert a transaction", () => {
			sinon.stub(transactionIndexController, "editTransaction");
			transactionIndexController.tableActions.insertAction();
			transactionIndexController.editTransaction.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", () => {
		it("should delete a transaction", () => {
			sinon.stub(transactionIndexController, "deleteTransaction");
			transactionIndexController.tableActions.deleteAction(1);
			transactionIndexController.deleteTransaction.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", () => {
		it("should focus a transaction when no transaction is currently focussed", () => {
			transactionIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".transaction", {transactionId: 2});
		});

		it("should focus a transaction when another transaction is currently focussed", () => {
			$state.currentState("**.transaction");
			transactionIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.transaction", {transactionId: 2});
		});
	});

	describe("getTransactions", () => {
		let fromDate;

		beforeEach(() => {
			sinon.stub(transactionIndexController, "processTransactions");
			fromDate = "from date";
		});

		it("should show a loading indicator in the specified direction", () => {
			transactionIndexController.context.id = -1;
			transactionIndexController.getTransactions("test");
			transactionIndexController.loading.test.should.be.true;
		});

		it("should fetch transactions before the first transaction date when going backwards", () => {
			const firstTransactionDate = transactionIndexController.transactions[0].transaction_date;

			transactionIndexController.getTransactions("prev");
			transactionModel.all.should.have.been.calledWith("/payees/1", firstTransactionDate, "prev");
		});

		it("should fetch transactions after the last transaction date when going forwards", () => {
			const lastTransactionDate = transactionIndexController.transactions[transactionIndexController.transactions.length - 1].transaction_date;

			transactionIndexController.getTransactions("next");
			transactionModel.all.should.have.been.calledWith("/payees/1", lastTransactionDate, "next");
		});

		it("should fetch transactions without a from date in either direction if there are no transactions", () => {
			transactionIndexController.transactions = [];
			transactionIndexController.getTransactions();
			transactionModel.all.should.have.been.calledWith("/payees/1");
		});

		it("should fetch transactions from a specified transaction date in either direction", () => {
			transactionIndexController.getTransactions(null, fromDate);
			transactionModel.all.should.have.been.calledWith("/payees/1", fromDate);
		});

		it("should search for transactions from a specified date in either direction", () => {
			transactionIndexController.contextType = null;
			transactionIndexController.context = "search";
			transactionIndexController.getTransactions(null, fromDate);
			transactionModel.query.should.have.been.calledWith("search", fromDate);
		});

		it("should process the fetched transactions", () => {
			transactionIndexController.getTransactions(null, fromDate, 1);
			transactionIndexController.processTransactions.should.have.been.calledWith(transactionBatch, fromDate, 1);
		});

		it("should hide the loading indicator after fetching the transacactions", () => {
			transactionIndexController.getTransactions("test");
			transactionIndexController.loading.test.should.be.false;
		});
	});

	describe("processTransactions", () => {
		beforeEach(() => {
			transactionIndexController.openingBalance = null;
			transactionIndexController.transactions = null;
			transactionIndexController.atEnd = false;
			transactionIndexController.firstTransactionDate = null;
			transactionIndexController.lastTransactionDate = null;
			sinon.stub(transactionIndexController, "updateRunningBalances");
			sinon.stub(transactionIndexController, "focusTransaction");
		});

		it("should do nothing if no transactions to process", () => {
			transactionBatch.transactions = [];
			transactionIndexController.processTransactions(transactionBatch);
			(!transactionIndexController.openingBalance).should.be.true;
		});

		it("should make the opening balance of the batch available to the view", () => {
			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.openingBalance = transactionBatch.openingBalance;
		});

		it("should make the transactions available to the view", () => {
			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.transactions = transactionBatch.transactions;
		});

		it("should set a flag if we've reached the end", () => {
			transactionIndexController.processTransactions(transactionBatch, "from date");
			transactionIndexController.atEnd.should.be.true;
		});

		it("should set a flag if a from date was not specified", () => {
			transactionBatch.atEnd = false;
			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.atEnd.should.be.true;
		});

		it("should make the first transaction date available to the view", () => {
			const firstTransactionDate = transactionBatch.transactions[0].transaction_date;

			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.firstTransactionDate.should.equal(firstTransactionDate);
		});

		it("should make the last transaction date available to the view", () => {
			const lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length - 1].transaction_date;

			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.lastTransactionDate.should.equal(lastTransactionDate);
		});

		it("should calculate the running balances", () => {
			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.updateRunningBalances.should.have.been.called;
		});

		it("should focus the transaction row for a specified transaction", () => {
			transactionIndexController.processTransactions(transactionBatch, null, 1);
			transactionIndexController.focusTransaction.should.have.been.calledWith(1);
		});

		it("should update the reconciled totals when reconciling", () => {
			transactionIndexController = controllerTest("TransactionIndexController", {contextModel: accountModel});
			sinon.stub(transactionIndexController, "updateReconciledTotals");
			transactionIndexController.reconciling = true;
			transactionIndexController.processTransactions(transactionBatch);
			transactionIndexController.updateReconciledTotals.should.have.been.called;
		});
	});

	describe("updateRunningBalances", () => {
		it("should do nothing for investment accounts", () => {
			transactionIndexController.context.account_type = "investment";
			transactionIndexController.updateRunningBalances();
			transactionIndexController.transactions.should.deep.equal(transactionBatch.transactions);
		});

		it("should calculate a running balance on each transaction", () => {
			transactionIndexController.updateRunningBalances();
			transactionIndexController.transactions.pop().balance.should.equal(95);
		});
	});

	describe("focusTransaction", () => {
		beforeEach(() => (transactionIndexController.tableActions.focusRow = sinon.stub()));

		it("should do nothing when the specific transaction row could not be found", () => {
			(!transactionIndexController.focusTransaction(999)).should.be.true;
			transactionIndexController.tableActions.focusRow.should.not.have.been.called;
		});

		it("should focus the transaction row for the specified transaction", () => {
			const targetIndex = transactionIndexController.focusTransaction(1);

			$timeout.flush();
			transactionIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified transaction", () => {
			const targetIndex = transactionIndexController.focusTransaction(1);

			targetIndex.should.equal(0);
		});
	});

	describe("toggleShowAllDetails", () => {
		it("should update the show all details setting", () => {
			transactionIndexController.toggleShowAllDetails(true);
			transactionModel.showAllDetails.should.have.been.calledWith(true);
		});

		it("should set a flag to indicate that we're showing all details", () => {
			transactionIndexController.showAllDetails = false;
			transactionIndexController.toggleShowAllDetails(true);
			transactionIndexController.showAllDetails.should.be.true;
		});
	});

	describe("(account context)", () => {
		beforeEach(() => (transactionIndexController = controllerTest("TransactionIndexController", {contextModel: accountModel})));

		it("should set a flag to enable reconciling", () => transactionIndexController.reconcilable.should.be.true);

		it("should fetch the unreconciled only setting for the current account", () => accountModel.isUnreconciledOnly.should.have.been.calledWith(transactionIndexController.context.id));

		describe("toggleUnreconciledOnly", () => {
			let	direction,
					fromDate,
					transactionIdToFocus;

			beforeEach(() => {
				transactionIndexController.unreconciledOnly = false;
				sinon.stub(transactionIndexController, "getTransactions");
				direction = "next";
				fromDate = "from date";
				transactionIdToFocus = 1;
			});

			it("should do nothing if we're currently reconciling", () => {
				transactionIndexController.reconciling = true;
				transactionIndexController.toggleUnreconciledOnly(true);
				accountModel.unreconciledOnly.should.not.have.been.called;
			});

			it("should update the unreconciled only setting for the current account", () => {
				transactionIndexController.toggleUnreconciledOnly(true);
				accountModel.unreconciledOnly.should.have.been.calledWith(transactionIndexController.context.id, true);
			});

			it("should set a flag to indicate that we're showing unreconciled transactions only", () => {
				transactionIndexController.toggleUnreconciledOnly(true);
				transactionIndexController.unreconciledOnly.should.be.true;
			});

			it("should clear the list of transactions", () => {
				transactionIndexController.toggleUnreconciledOnly(true);
				transactionIndexController.transactions.should.be.empty;
			});

			it("should refetch a batch of transactions in the specified direction", () => {
				transactionIndexController.toggleUnreconciledOnly(true, direction, fromDate, transactionIdToFocus);
				transactionIndexController.getTransactions.should.have.been.calledWith(direction, fromDate, transactionIdToFocus);
			});

			it("should refetch a batch of transactions in the previous direction if a direction is not specified", () => {
				direction = null;
				transactionIndexController.toggleUnreconciledOnly(true, direction, fromDate, transactionIdToFocus);
				transactionIndexController.getTransactions.should.have.been.calledWith("prev", fromDate, transactionIdToFocus);
			});
		});

		describe("save", () => {
			let contextId;

			beforeEach(() => {
				contextId = 1;
				transactionIndexController.context.id = contextId;
				transactionIndexController.reconciling = true;
				sinon.stub(transactionIndexController, "getTransactions");
				transactionIndexController.save();
			});

			it("should update all cleared transactions to reconciled", () => accountModel.reconcile.should.have.been.calledWith(contextId));

			it("should cleared the account's closing balance", () => $window.localStorage.removeItem.should.have.been.calledWith("lootClosingBalance-1"));

			it("should exit reconcile mode", () => transactionIndexController.reconciling.should.be.false);

			it("should clear the list of transactions", () => {
				transactionIndexController.transactions.should.be.an.Array;
				transactionIndexController.transactions.should.be.empty;
			});

			it("should refresh the list of transactions", () => transactionIndexController.getTransactions.should.have.been.calledWith("prev"));
		});

		describe("cancel", () => {
			it("should exit reconcile mode", () => {
				transactionIndexController.reconciling = true;
				transactionIndexController.cancel();
				transactionIndexController.reconciling.should.be.false;
			});
		});

		describe("reconcile", () => {
			it("should do nothing if we're currently reconciling", () => {
				transactionIndexController.reconciling = true;
				transactionIndexController.reconcile();
				$uibModal.open.should.not.have.been.called;
			});

			describe("(not already reconciling)", () => {
				beforeEach(() => {
					sinon.stub(transactionIndexController, "toggleUnreconciledOnly");
					transactionIndexController.reconciling = false;
					transactionIndexController.reconcile();
				});

				it("should disable navigation on the table", () => ogTableNavigableService.enabled.should.be.false);

				it("should prompt the user for the accounts closing balance", () => {
					$uibModal.open.should.have.been.called;
					$uibModal.resolves.account.should.deep.equal(transactionIndexController.context);
				});

				it("should make the closing balance available to the view when the modal is closed", () => {
					const closingBalance = 100;

					$uibModal.close(closingBalance);
					transactionIndexController.closingBalance.should.equal(closingBalance);
				});

				it("should refetch the list of unreconciled transactions when the modal is closed", () => {
					$uibModal.close();
					transactionIndexController.toggleUnreconciledOnly.should.have.been.calledWith(true);
				});

				it("should enter reconcile mode when the modal is closed", () => {
					$uibModal.close();
					transactionIndexController.reconciling.should.be.true;
				});

				it("should enable navigation on the table when the modal is closed", () => {
					$uibModal.close();
					ogTableNavigableService.enabled.should.be.true;
				});

				it("should enable navigation on the table when the modal is dismissed", () => {
					$uibModal.dismiss();
					ogTableNavigableService.enabled.should.be.true;
				});
			});
		});

		describe("updateReconciledTotals", () => {
			beforeEach(() => {
				transactionIndexController.openingBalance = 100.002;
				transactionIndexController.closingBalance = 300.008;
				transactionIndexController.updateReconciledTotals();
			});

			it("should set the reconcile target to the difference between the opening and closing balances", () => transactionIndexController.reconcileTarget.should.equal(200.01));

			it("should set the cleared total to the sum of all cleared transaction amounts", () => transactionIndexController.clearedTotal.should.equal(2));

			it("should set the uncleared total to the difference between the cleared total and the reconcile target", () => transactionIndexController.unclearedTotal.should.equal(198.01));
		});

		describe("toggleCleared", () => {
			let	transaction;

			beforeEach(() => {
				transaction = {
					id: 1,
					status: "status"
				};
				sinon.stub(transactionIndexController, "updateReconciledTotals");
				transactionIndexController.toggleCleared(transaction);
			});

			it("should update the transaction status", () => transactionModel.updateStatus.should.have.been.calledWith("/accounts/1", transaction.id, transaction.status));

			it("should update the reconciled totals", () => transactionIndexController.updateReconciledTotals.should.have.been.called);
		});
	});

	describe("toggleSubtransactions", () => {
		let	event,
				transaction;

		beforeEach(() => {
			event = {
				cancelBubble: false
			};
			transaction = {
				id: -1,
				showSubtransactions: true
			};
		});

		it("should toggle a flag on the transaction indicating whether subtransactions are shown", () => {
			transactionIndexController.toggleSubtransactions(event, transaction);
			transaction.showSubtransactions.should.be.false;
		});

		it("should do nothing if we're not showing subtransactions", () => {
			transactionIndexController.toggleSubtransactions(event, transaction);
			transactionModel.findSubtransactions.should.not.have.been.called;
		});

		describe("(on shown)", () => {
			beforeEach(() => {
				transaction.showSubtransactions = false;
				transaction.loadingSubtransactions = false;
				transaction.subtransactions = null;
			});

			it("should show a loading indicator", () => {
				transactionIndexController.toggleSubtransactions(event, transaction);
				transaction.showSubtransactions.should.be.true;
				transaction.loadingSubtransactions.should.be.true;
			});

			it("should clear the subtransactions for the transaction", () => {
				transactionIndexController.toggleSubtransactions(event, transaction);
				transaction.subtransactions.should.be.an.Array;
				transaction.subtransactions.should.be.empty;
			});

			it("should fetch the subtransactions", () => {
				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(event, transaction);
				transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
			});

			it("should update the transaction with it's subtransactions", () => {
				const subtransactions = [
					{id: 1, transaction_type: "Transfer", account: "subtransfer account"},
					{id: 2, category: "subtransaction category"},
					{id: 3, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
				];

				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(event, transaction);
				transaction.subtransactions.should.deep.equal(subtransactions);
			});

			it("should hide the loading indicator", () => {
				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(event, transaction);
				transaction.loadingSubtransactions.should.be.false;
			});
		});

		it("should prevent the event from bubbling", () => {
			transactionIndexController.toggleSubtransactions(event, transaction);
			event.cancelBubble.should.be.true;
		});
	});

	describe("flag", () => {
		let transaction;

		beforeEach(() => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			transactionIndexController.flag(1);
		});

		it("should disable navigation on the table", () => ogTableNavigableService.enabled.should.be.false);

		it("should show the flag modal for the transaction", () => {
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.transaction.should.deep.equal(transaction);
		});

		it("should update the transaction in the list of transactions when the modal is closed", () => {
			transaction.flag = "test flag";
			$uibModal.close(transaction);
			transactionIndexController.transactions[1].should.deep.equal(transaction);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			$uibModal.close(transaction);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dismissed", () => {
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("switchTo", () => {
		let	transaction,
				stateParams,
				$event;

		beforeEach(() => {
			transaction = {
				id: "transaction id",
				parent_id: "parent id"
			};

			stateParams = {
				id: "test id",
				transactionId: transaction.id
			};

			$event = {
				stopPropagation: sinon.stub()
			};
		});

		it("should transition to the specified state passing the transaction id", () => {
			transaction.parent_id = null;
			transactionIndexController.switchTo(null, "state", stateParams.id, transaction);
			$state.go.should.have.been.calledWith("root.state.transactions.transaction", stateParams);
		});

		it("should transition to the specified state passing the parent transaction id if present", () => {
			stateParams.transactionId = transaction.parent_id;
			transactionIndexController.switchTo(null, "state", stateParams.id, transaction);
			$state.go.should.have.been.calledWith("root.state.transactions.transaction", stateParams);
		});

		it("should transition to the specified state passing the transaction id for a Subtransaction", () => {
			transaction.transaction_type = "Sub";
			transactionIndexController.switchTo(null, "state", stateParams.id, transaction);
			$state.go.should.have.been.calledWith("root.state.transactions.transaction", stateParams);
		});

		it("should stop the event from propagating if present", () => {
			transactionIndexController.switchTo($event, "state", stateParams.id, transaction);
			$event.stopPropagation.should.have.been.called;
		});
	});

	describe("switchToAccount", () => {
		let	id,
				transaction;

		beforeEach(() => {
			sinon.stub(transactionIndexController, "switchTo");
			id = "test id";
			transaction = {};
		});

		it("should not toggle the unreconciled only setting for the account if the transaction is not reconciled", () => {
			transactionIndexController.switchToAccount(null, id, transaction);
			accountModel.unreconciledOnly.should.not.have.been.called;
		});

		it("should toggle the unreconciled only setting for the account if the transaction is reconciled", () => {
			transaction.status = "Reconciled";
			transactionIndexController.switchToAccount(null, id, transaction);
			accountModel.unreconciledOnly.should.have.been.calledWith(id, false);
		});

		it("should transition to the specified state", () => {
			const event = "test event";

			transactionIndexController.switchToAccount(event, id, transaction);
			transactionIndexController.switchTo.should.have.been.calledWith(event, "accounts.account", id, transaction);
		});
	});

	describe("switchAccount", () => {
		it("should switch to the other side of the transaction", () => {
			const event = "test event",
						transaction = {account: {id: 1}, primary_account: {id: 2}};

			sinon.stub(transactionIndexController, "switchToAccount");
			transactionIndexController.switchAccount(event, transaction);
			transactionIndexController.switchToAccount.should.have.been.calledWith(event, transaction.account.id, transaction);
		});
	});

	describe("switchPrimaryAccount", () => {
		it("should switch to the primary account of the transaction", () => {
			const event = "test event",
						transaction = {account: {id: 1}, primary_account: {id: 2}};

			sinon.stub(transactionIndexController, "switchToAccount");
			transactionIndexController.switchPrimaryAccount(event, transaction);
			transactionIndexController.switchToAccount.should.have.been.calledWith(event, transaction.primary_account.id, transaction);
		});
	});

	describe("switchPayee", () => {
		it("should switch to the payee of the transaction", () => {
			const event = "test event",
						transaction = {payee: {id: 1}};

			sinon.stub(transactionIndexController, "switchTo");
			transactionIndexController.switchPayee(event, transaction);
			transactionIndexController.switchTo.should.have.been.calledWith(event, "payees.payee", transaction.payee.id, transaction);
		});
	});

	describe("switchSecurity", () => {
		it("should switch to the security of the transaction", () => {
			const event = "test event",
						transaction = {security: {id: 1}};

			sinon.stub(transactionIndexController, "switchTo");
			transactionIndexController.switchSecurity(event, transaction);
			transactionIndexController.switchTo.should.have.been.calledWith(event, "securities.security", transaction.security.id, transaction);
		});
	});

	describe("switchCategory", () => {
		it("should switch to the category of the transaction", () => {
			const event = "test event",
						transaction = {category: {id: 1}};

			sinon.stub(transactionIndexController, "switchTo");
			transactionIndexController.switchCategory(event, transaction);
			transactionIndexController.switchTo.should.have.been.calledWith(event, "categories.category", transaction.category.id, transaction);
		});
	});

	describe("switchSubcategory", () => {
		it("should switch to the subcategory of the transaction", () => {
			const event = "test event",
						transaction = {subcategory: {id: 1}};

			sinon.stub(transactionIndexController, "switchTo");
			transactionIndexController.switchSubcategory(event, transaction);
			transactionIndexController.switchTo.should.have.been.calledWith(event, "categories.category", transaction.subcategory.id, transaction);
		});
	});

	describe("transitionSuccessHandler", () => {
		let	transactionId,
				focusTransactionStub;

		beforeEach(() => (focusTransactionStub = sinon.stub(transactionIndexController, "focusTransaction").returns(1)));

		it("should ensure the transaction is focussed when the transaction id state param changes", () => {
			transactionId = 2;
			transactionIndexController.transitionSuccessHandler(transactionId);
			transactionIndexController.focusTransaction.should.have.been.calledWith(transactionId);
		});

		describe("(transaction not found)", () => {
			beforeEach(() => {
				sinon.stub(transactionIndexController, "getTransactions");
				focusTransactionStub.withArgs(3).returns(NaN);
				transactionId = 3;
			});

			it("should fetch the transaction details", () => {
				transactionIndexController.transitionSuccessHandler(transactionId);
				transactionModel.find.should.have.been.calledWith(transactionId);
			});

			describe("(showing unreconciled only)", () => {
				it("should toggle to show all transactions", () => {
					const transactionDate = subDays(startOfDay(new Date()), 1);
					let direction;

					transactionIndexController = controllerTest("TransactionIndexController", {contextModel: accountModel});
					sinon.stub(transactionIndexController, "focusTransaction").returns(NaN);
					sinon.stub(transactionIndexController, "toggleUnreconciledOnly");
					transactionIndexController.unreconciledOnly = true;
					transactionIndexController.transitionSuccessHandler(transactionId);
					transactionIndexController.toggleUnreconciledOnly.should.have.been.calledWith(false, direction, transactionDate, transactionId);
				});
			});

			describe("(transaction date is before the current batch)", () => {
				it("should fetch a new transaction batch starting from the new transaction date", () => {
					const fromDate = subDays(startOfDay(new Date()), 2);

					transactionIndexController.firstTransactionDate = startOfDay(new Date());
					transactionIndexController.transitionSuccessHandler(transactionId);
					transactionIndexController.getTransactions.should.have.been.calledWith("next", fromDate);
				});
			});

			describe("(transaction date is after the current batch)", () => {
				it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", () => {
					const fromDate = startOfDay(new Date());

					transactionIndexController.lastTransactionDate = subDays(startOfDay(new Date()), 2);
					transactionIndexController.atEnd = false;
					transactionIndexController.transitionSuccessHandler(transactionId);
					transactionIndexController.getTransactions.should.have.been.calledWith("prev", fromDate);
				});

				it("should fetch a new transaction batch for the current transaction date if we're already at the end", () => {
					const fromDate = subDays(startOfDay(new Date()), 1);
					let direction;

					transactionIndexController.lastTransactionDate = subDays(startOfDay(new Date()), 2);
					transactionIndexController.atEnd = true;
					transactionIndexController.transitionSuccessHandler(transactionId);
					transactionIndexController.getTransactions.should.have.been.calledWith(direction, fromDate);
				});
			});
		});
	});
});
