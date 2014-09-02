(function() {
	"use strict";

	/*jshint expr: true */

	describe.only("transactionIndexController", function() {
		// The object under test
		var transactionIndexController;

		// Dependencies
		var controllerTest,
				$modal,
				$timeout,
				$window,
				$state,
				$q,
				transactionModel,
				accountModel,
				contextModel,
				context,
				transactionBatch;

		// Load the modules
		beforeEach(module("lootMocks", "transactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modal", "$window", "$state", "transactionModel", "accountModel", "contextModel", "context", "transactionBatch"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modal_, _$timeout_, _$window_, _$state_, _$q_, _transactionModel_, _accountModel_, _contextModel_, _context_, _transactionBatch_) {
			controllerTest = _controllerTest_;
			$modal = _$modal_;
			$timeout = _$timeout_;
			$window = _$window_;
			$state = _$state_;
			$q = _$q_;
			transactionModel = _transactionModel_;
			accountModel = _accountModel_;
			contextModel = _contextModel_;
			context = _context_;
			transactionBatch = _transactionBatch_;
			transactionIndexController = controllerTest("transactionIndexController");
		}));

		it("should make the passed context available on the $scope", function() {
			transactionIndexController.context.should.deep.equal(context);
		});

		it("should make the passed context type available on the scope", function() {
			transactionIndexController.contextType.should.equal(contextModel.type());
		});
			
		describe("editTransaction", function() {
			var transaction,
					contextChangedStub;

			beforeEach(function() {
				contextChangedStub = sinon.stub(transactionIndexController, "contextChanged");
				sinon.stub(transactionIndexController, "getTransactions");
				sinon.stub(transactionIndexController, "updateRunningBalances");
				sinon.stub(transactionIndexController, "focusTransaction");
				transaction = angular.copy(transactionIndexController.transactions[1]);
			});

			it("should disable navigation on the table", function() {
				transactionIndexController.editTransaction();
				transactionIndexController.navigationDisabled.should.be.true;
			});

			describe("(edit existing)", function() {
				it("should do nothing if the transaction can't be edited", function() {
					sinon.stub(transactionIndexController, "isAllowed").returns(false);
					transactionIndexController.editTransaction(1);
					(!!transactionIndexController.navigationDisabled).should.be.false;
					$modal.open.should.not.have.been.called;
				});

				it("should open the edit transaction modal with a transaction", function() {
					transactionIndexController.editTransaction(1);
					$modal.open.should.have.been.called;
					$modal.resolves.transaction.should.deep.equal(transaction);
					transactionModel.findSubtransactions.should.not.have.been.called;
				});

				var scenarios = ["Split", "LoanRepayment", "Payslip"];

				scenarios.forEach(function(scenario) {
					it("should prefetch the subtransactions for a " + scenario + " transaction", function() {
						transactionIndexController.transactions[1].transaction_type = scenario;
						transactionIndexController.editTransaction(1);
						transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
						$modal.resolves.transaction.should.eventually.have.a.property("subtransactions");
					});
				});
				
				it("should update the transaction in the list of transactions when the modal is closed", function() {
					transaction.memo = "edited transaction";
					transactionIndexController.editTransaction(1);
					$modal.close(transaction);
					transactionIndexController.transactions.should.include(transaction);
				});
			});

			describe("(add new)", function() {
				beforeEach(function() {
					transaction = {
						transaction_type: "Basic",
						transaction_date: moment().format("YYYY-MM-DD"),
						primary_account: undefined,
						payee: undefined,
						security: undefined,
						category: undefined,
						subcategory: undefined,
						subtransactions: [{},{},{},{}]
					};
				});

				describe("(default values)", function() {
					it("should open the edit transaction modal with a default primary account if the context type is account", function() {
						transactionIndexController.contextType = "account";
						transactionIndexController.context = "test account";
						transaction.primary_account = transactionIndexController.context;
					});

					it("should open the edit transaction modal with a default payee if the context type is payee", function() {
						transactionIndexController.contextType = "payee";
						transactionIndexController.context = "test payee";
						transaction.payee = transactionIndexController.context;
					});

					it("should open the edit transaction modal with a default security if the context type is security", function() {
						transactionIndexController.contextType = "security";
						transactionIndexController.context = "test security";
						transaction.security = transactionIndexController.context;
					});

					it("should open the edit transaction modal with a default category if the context type is category and the context is a category", function() {
						transactionIndexController.contextType = "category";
						transactionIndexController.context = "test category";
						transaction.category = transactionIndexController.context;
					});

					it("should open the edit transaction modal with a default category and subcategory if the context type is category and the context is a subcategory", function() {
						transactionIndexController.contextType = "category";
						transactionIndexController.context = {id: "test subcategory", parent: "test category"};
						transaction.category = "test category";
						transaction.subcategory = transactionIndexController.context;
					});

					afterEach(function() {
						transactionIndexController.editTransaction();
						$modal.open.should.have.been.called;
						$modal.resolves.transaction.should.deep.equal(transaction);
					});
					
				});

				it("should add the new transaction to the list of transactions when the modal is closed", function() {
					transaction.payee = context;
					transactionIndexController.editTransaction();
					$modal.close(transaction);
					transactionIndexController.transactions.pop().should.deep.equal(transaction);
				});
			});

			it("should check if the context has changed when the modal is closed", function() {
				transactionIndexController.editTransaction(1);
				$modal.close(transaction);
				transactionIndexController.contextChanged.should.have.been.calledWith(transaction);
			});

			describe("(on context changed)", function() {
				beforeEach(function() {
					$state.currentState("**.transaction");
					contextChangedStub.returns(true);
					transactionIndexController.editTransaction(1);
					$modal.close(transaction);
				});

				it("should remove the transaction from the list of transactions", function() {
					transactionIndexController.transactions.should.not.include(transaction);
				});

				it("should transition to the parent state if the transaction was focussed", function() {
					$state.go.should.have.been.calledWith("^");
				});
			});

			describe("(transaction date is before the current batch", function() {
				it("should fetch a new transaction batch starting from the new transaction date", function() {
					transaction.transaction_date = moment(transactionIndexController.firstTransactionDate).subtract(1, "day").format("YYYY-MM-DD");
					transactionIndexController.editTransaction(1);
					$modal.close(transaction);
					transactionIndexController.getTransactions.should.have.been.calledWith("next", moment(transaction.transaction_date).subtract(1, "day").toISOString(), transaction.id);
				});
			});

			describe("(transaction date is after the current batch", function() {
				beforeEach(function() {
					transaction.transaction_date = moment(transactionIndexController.lastTransactionDate).add(1, "day").format("YYYY-MM-DD");
					transactionIndexController.editTransaction(1);
				});

				it("should not fetch a new transaction batch if we're already at the end", function() {
					transactionIndexController.atEnd = true;
					$modal.close(transaction);
					transactionIndexController.getTransactions.should.not.have.been.called;
				});

				it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", function() {
					transactionIndexController.atEnd = false;
					$modal.close(transaction);
					transactionIndexController.getTransactions.should.have.been.calledWith("prev", moment(transaction.transaction_date).add(1, "day").toISOString(), transaction.id);
				});
			});

			describe("transaction date is within the current batch, or we're at the end", function() {
				it("should not fetch a new transaction batch when the modal is closed", function() {
					transactionIndexController.editTransaction(1);
					$modal.close(transaction);
					transactionIndexController.getTransactions.should.not.have.been.called;
				});

				it("should resort the transaction list when the modal is closed", function() {
					transaction.id = 999;
					transaction.transaction_date = moment().subtract(1, "days").format("YYYY-MM-DD");
					transactionIndexController.editTransaction(1);
					$modal.close(transaction);
					transactionIndexController.transactions.pop().should.deep.equal(transaction);
				});

				it("should recalculate the running balances when the modal is closed", function() {
					transactionIndexController.editTransaction();
					$modal.close(transaction);
					transactionIndexController.updateRunningBalances.should.have.been.called;
				});

				it("should focus the transaction when the modal is closed", function() {
					transactionIndexController.editTransaction();
					$modal.close(transaction);
					transactionIndexController.focusTransaction.should.have.been.calledWith(transaction.id);
				});

				it("should refetch the context to the get updated closing balance when the modal is closed", function() {
					transactionIndexController.context.name = undefined;
					transactionIndexController.editTransaction();
					$modal.close(transaction);
					contextModel.find.should.have.been.calledWith(context.id);
					transactionIndexController.context.name.should.not.be.undefined;
				});
			});

			it("should not change the transactions list when the modal is dismissed", function() {
				var originalTransactions = angular.copy(transactionIndexController.transactions);
				transactionIndexController.editTransaction();
				$modal.dismiss();
				transactionIndexController.transactions.should.deep.equal(originalTransactions);
			});

			it("should enable navigation on the table when the modal is closed", function() {
				transactionIndexController.editTransaction();
				$modal.close(transaction);
				transactionIndexController.navigationDisabled.should.be.false;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				transactionIndexController.editTransaction();
				$modal.dismiss();
				transactionIndexController.navigationDisabled.should.be.false;
			});
		});

		describe("contextChanged", function() {
			var transaction;

			beforeEach(function() {
				transaction = angular.copy(transactionIndexController.transactions[1]);
			});

			describe("(search mode)", function() {
				beforeEach(function() {
					transactionIndexController.contextType = undefined;
					transactionIndexController.context = "search";
				});

				it("should return true when the transaction memo no longer contains the search query", function() {
					transaction.memo = "test memo";
					transactionIndexController.contextChanged(transaction).should.be.true;
				});

				it("should return false when the transaction memo contains the search query", function() {
					transaction.memo = "test search";
					transactionIndexController.contextChanged(transaction).should.be.false;
				});
			});

			describe("(context mode)", function() {
				var scenarios = [
					{type: "account", field: "primary_account", context: {id: "test primary account"}},
					{type: "payee", field: "payee", context: {id: "test payee"}},
					{type: "security", field: "security", context: {id: "test security"}},
					{type: "category", field: "category", context: {id: "test category"}},
					{type: "category", field: "subcategory", context: {id: "test subcategory", parent: "test category"}}
				];

				angular.forEach(scenarios, function(scenario) {
					it("should return true when the context type is " + scenario.type + " and the transaction " + scenario.field + " no longer matches the context", function() {
						transactionIndexController.contextType = scenario.type;
						transactionIndexController.context = scenario.context;
						transaction[scenario.field] = {id: "edited"};
						transactionIndexController.contextChanged(transaction).should.be.true;
					});

					it("should return false when the context type is " + scenario.type + " and the transaction " + scenario.field + " matches the context", function() {
						transactionIndexController.contextType = scenario.type;
						transactionIndexController.context = scenario.context;
						transaction[scenario.field] = scenario.context;
						transactionIndexController.contextChanged(transaction).should.be.false;
					});
				});
			});
		});

		describe("deleteTransaction", function() {
			var transaction;

			beforeEach(function() {
				transaction = angular.copy(transactionIndexController.transactions[1]);
			});

			it("should do nothing if the transaction can't be deleted", function() {
				sinon.stub(transactionIndexController, "isAllowed").returns(false);
				transactionIndexController.deleteTransaction(1);
				(!!transactionIndexController.navigationDisabled).should.be.false;
				$modal.open.should.not.have.been.called;
			});

			it("should disable navigation on the table", function() {
				transactionIndexController.deleteTransaction(1);
				transactionIndexController.navigationDisabled.should.be.true;
			});

			it("should open the delete transaction modal with a transaction", function() {
				transactionIndexController.deleteTransaction(1);
				$modal.open.should.have.been.called;
				$modal.resolves.transaction.should.deep.equal(transaction);
			});

			it("should remove the transaction from the transactions list when the modal is closed", function() {
				transactionIndexController.deleteTransaction(1);
				$modal.close(transaction);
				transactionIndexController.transactions.should.not.include(transaction);
			});

			it("should transition to the parent state if the transaction was focussed", function() {
				$state.currentState("**.transaction");
				transactionIndexController.deleteTransaction(1);
				$modal.close(transaction);
				$state.go.should.have.been.calledWith("^");
			});

			it("should enable navigation on the table when the modal is closed", function() {
				transactionIndexController.deleteTransaction(1);
				$modal.close(transaction);
				transactionIndexController.navigationDisabled.should.be.false;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				transactionIndexController.deleteTransaction(1);
				$modal.dismiss();
				transactionIndexController.navigationDisabled.should.be.false;
			});
		});

		describe("isAllowed", function() {
			var transaction;

			beforeEach(function() {
				sinon.stub(transactionIndexController, "promptToSwitchAccounts");
				transaction = angular.copy(transactionIndexController.transactions[1]);
				transaction.primary_account = {account_type: "bank"};
			});

			describe("(not allowed)", function() {
				var scenarios = [
					{action: "edit", type: "Sub", message: "This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?"},
					{action: "delete", type: "Sub", message: "This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?"},
					{action: "edit", type: "Subtransfer", message: "This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?"},
					{action: "delete", type: "Subtransfer", message: "This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?"},
					{action: "edit", type: "Dividend", message: "This is an investment transaction. You can only edit if from the investment account. Would you like to switch to the investment account now?"},
					{action: "edit", type: "SecurityInvestment", message: "This is an investment transaction. You can only edit if from the investment account. Would you like to switch to the investment account now?"}
				];

				angular.forEach(scenarios, function(scenario) {
					it("should prompt to switch accounts when attempting to " + scenario.action + " a " + scenario.type + " transaction", function() {
						transaction.transaction_type = scenario.type;
						transactionIndexController.isAllowed(scenario.action, transaction);
						transactionIndexController.promptToSwitchAccounts.should.have.been.calledWith(scenario.message, transaction);
					});

					it("should return false when attempting to " + scenario.action + " a " + scenario.type + " transaction", function() {
						transaction.transaction_type = scenario.type;
						transactionIndexController.isAllowed(scenario.action, transaction).should.be.false;
					});
				});
			});

			describe("(allowed)", function() {
				var scenarios = [
					{action: "edit", type: "Basic"},
					{action: "delete", type: "Basic"},
					{action: "edit", type: "Dividend", account_type: "investment"},
					{action: "delete", type: "Dividend"},
					{action: "edit", type: "SecurityInvestment", account_type: "investment"},
					{action: "delete", type: "SecurityInvestment"}
				];

				angular.forEach(scenarios, function(scenario) {
					it("should not prompt to switch accounts when attempting to " + scenario.action + " a " + scenario.type + " transaction" + (scenario.account_type ? " from an " + scenario.account_type + " acount" : ""), function() {
						transaction.transaction_type = scenario.type;
						transaction.primary_account.account_type = scenario.account_type || transaction.primary_account.account_type;
						transactionIndexController.isAllowed(scenario.action, transaction);
						transactionIndexController.promptToSwitchAccounts.should.not.have.been.called;
					});

					it("should return true when attempting to " + scenario.action + " a " + scenario.type + " transaction" + (scenario.account_type ? " from an " + scenario.account_type + " acount" : ""), function() {
						transaction.transaction_type = scenario.type;
						transaction.primary_account.account_type = scenario.account_type || transaction.primary_account.account_type;
						transactionIndexController.isAllowed(scenario.action, transaction).should.be.true;
					});
				});
			});
		});

		describe("promptToSwitchAccounts", function() {
			var message,
					transaction;

			beforeEach(function() {
				sinon.stub(transactionIndexController, "switchAccount");
				sinon.stub(transactionIndexController, "switchPrimaryAccount");
				message = "test message";
				transaction = angular.copy(transactionIndexController.transactions[1]);
				transaction.account = {id: "account"};
				transaction.primary_account = {id: "primary account"};
				transactionIndexController.promptToSwitchAccounts(message, transaction);
			});

			it("should disable navigation on the table", function() {
				transactionIndexController.navigationDisabled.should.be.true;
			});

			it("should prompt the user to switch to the other account", function() {
				$modal.open.should.have.been.called;
				$modal.resolves.confirm.message.should.equal(message);
			});

			it("should switch to the other account when the modal is closed", function() {
				$modal.close();
				transactionIndexController.switchAccount.should.have.been.calledWith(null, transaction);
			});

			it("should switch to the primary account if there is no other account when the modal is closed", function() {
				transaction.account = undefined;
				$modal.close();
				transactionIndexController.switchPrimaryAccount.should.have.been.calledWith(null, transaction);
			});

			it("should enable navigation on the table when the modal is closed", function() {
				$modal.close();
				transactionIndexController.navigationDisabled.should.be.false;
			});

			it("should enable navigation on the table when the modal is dismissed", function() {
				$modal.dismiss();
				transactionIndexController.navigationDisabled.should.be.false;
			});
		});

		describe("tableActions.navigationEnabled", function() {
			it("should return false when navigation is disabled locally", function() {
				transactionIndexController.navigationDisabled = true;
				transactionIndexController.tableActions.navigationEnabled().should.be.false;
			});

			it("should return false when navigation is disabled globally", function() {
				transactionIndexController.navigationGloballyDisabled = true;
				transactionIndexController.tableActions.navigationEnabled().should.be.false;
			});

			it("should return true when navigation is not disabled locally or globally", function() {
				transactionIndexController.tableActions.navigationEnabled().should.be.true;
			});
		});

		describe("tableActions.selectAction", function() {
			describe("(not reconciling)", function() {
				it("should edit a transaction", function() {
					sinon.stub(transactionIndexController, "editTransaction");
					transactionIndexController.tableActions.selectAction(1);
					transactionIndexController.editTransaction.should.have.been.calledWith(1);
				});
			});

			// TODO - need to set contextType to "account" and recompile the controller
			describe.skip("(reconciling)", function() {
				beforeEach(function() {
					transactionIndexController.reconciling = true;
					sinon.stub(transactionIndexController, "toggleCleared");
				});

				it("should set the transaction status to Cleared if not already", function() {
					transactionIndexController.transactions[1].status = "";
					transactionIndexController.tableActions.selectAction(1);
					transactionIndexController.transactions[1].status.should.equal("Cleared");
				});

				it("should clear the transaction status if set to Cleared", function() {
					transactionIndexController.transactions[1].status = "Cleared";
					transactionIndexController.tableActions.selectAction(1);
					transactionIndexController.transactions[1].status.should.equal("");
				});

				it("should toggle the transaction's cleared status", function() {
					transactionIndexController.tableActions.selectAction(1);
					transactionIndexController.toggleCleared.should.have.been.calledWith(transactionIndexController.transactions[1]);
				});
			});
		});

		describe("tableActions.editAction", function() {
			it("should edit the transaction", function() {
				transactionIndexController.tableActions.editAction.should.equal(transactionIndexController.editTransaction);
			});
		});

		describe("tableActions.insertAction", function() {
			it("should insert a transaction", function() {
				sinon.stub(transactionIndexController, "editTransaction");
				transactionIndexController.tableActions.insertAction();
				transactionIndexController.editTransaction.should.have.been.calledWith(undefined);
			});
		});

		describe("tableActions.deleteAction", function() {
			it("should delete a transaction", function() {
				transactionIndexController.tableActions.deleteAction.should.equal(transactionIndexController.deleteTransaction);
			});
		});

		describe("tableActions.focusAction", function() {
			it("should focus a transaction when no transaction is currently focussed", function() {
				transactionIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith(".transaction", {transactionId: 2});
			});

			it("should focus a transaction when another transaction is currently focussed", function() {
				$state.currentState("**.transaction");
				transactionIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith("^.transaction", {transactionId: 2});
			});
		});

		describe("getTransactions", function() {
			var fromDate;

			beforeEach(function() {
				sinon.stub(transactionIndexController, "processTransactions");
				fromDate = "from date";
			});

			it("should show a loading indicator in the specified direction", function() {
				transactionIndexController.context.id = -1;
				transactionIndexController.getTransactions("test");
				transactionIndexController.loading.test.should.be.true;
			});

			it("should fetch transactions before the first transaction date when going backwards", function() {
				var firstTransactionDate = transactionIndexController.transactions[0].transaction_date;
				transactionIndexController.getTransactions("prev");
				transactionModel.all.should.have.been.calledWith("/payees/1", firstTransactionDate, "prev");
			});

			it("should fetch transactions after the last transaction date when going forwards", function() {
				var lastTransactionDate = transactionIndexController.transactions[transactionIndexController.transactions.length - 1].transaction_date;
				transactionIndexController.getTransactions("next");
				transactionModel.all.should.have.been.calledWith("/payees/1", lastTransactionDate, "next");
			});

			it("should fetch transactions from a specified transaction date in either direction", function() {
				transactionIndexController.getTransactions(undefined, fromDate);
				transactionModel.all.should.have.been.calledWith("/payees/1", fromDate);
			});

			it("should search for transactions from a specified date in either direction", function() {
				transactionIndexController.contextType = undefined;
				transactionIndexController.context = "search";
				transactionIndexController.getTransactions(undefined, fromDate);
				transactionModel.query.should.have.been.calledWith("search", fromDate);
			});

			it("should process the fetched transactions", function() {
				transactionIndexController.getTransactions(undefined, fromDate, 1);
				transactionIndexController.processTransactions.should.have.been.calledWith(transactionBatch, fromDate, 1);
			});

			it("should hide the loading indicator after fetching the transacactions", function() {
				transactionIndexController.getTransactions("test");
				transactionIndexController.loading.test.should.be.false;
			});
		});

		describe("processTransactions", function() {
			beforeEach(function() {
				transactionIndexController.openingBalance = undefined;
				transactionIndexController.transactions = undefined;
				transactionIndexController.atEnd = false;
				transactionIndexController.firstTransactionDate = undefined;
				transactionIndexController.lastTransactionDate = undefined;
				sinon.stub(transactionIndexController, "updateRunningBalances");
				sinon.stub(transactionIndexController, "focusTransaction");
				//sinon.stub(transactionIndexController, "updateReconciledTotals");   // TODO - only available in account context
			});

			it("should do nothing if no transactions to process", function() {
				transactionBatch.transactions = [];
				transactionIndexController.processTransactions(transactionBatch);
				(undefined === transactionIndexController.openingBalance).should.be.true;
			});

			it("should make the opening balance of the batch available on the scope", function() {
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.openingBalance = transactionBatch.openingBalance;
			});

			it("should make the transactions available on the scope", function() {
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.transactions = transactionBatch.transactions;
			});

			it("should set a flag on the scope if we've reached the end", function() {
				transactionIndexController.processTransactions(transactionBatch, "from date");
				transactionIndexController.atEnd.should.be.true;
			});

			it("should set a flag on the scope if a from date was not specified", function() {
				transactionBatch.atEnd = false;
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.atEnd.should.be.true;
			});

			it("should make the first transaction date available on the scope", function() {
				var firstTransactionDate = transactionBatch.transactions[0].transaction_date;
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.firstTransactionDate.should.equal(firstTransactionDate);
			});

			it("should make the last transaction date available on the scope", function() {
				var lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length - 1].transaction_date;
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.lastTransactionDate.should.equal(lastTransactionDate);
			});

			it("should calculate the running balances", function() {
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.updateRunningBalances.should.have.been.called;
			});

			it("should focus the transaction row for a specified transaction", function() {
				transactionIndexController.processTransactions(transactionBatch, undefined, 1);
				transactionIndexController.focusTransaction.should.have.been.calledWith(1);
			});

			// TODO - only available in account context
			it.skip("should update the reconciled totals when reconciling", function() {
				transactionIndexController.reconciling = true;
				transactionIndexController.processTransactions(transactionBatch);
				transactionIndexController.updateReconciledTotals.should.have.been.called;
			});
		});

		describe("updateRunningBalances", function() {

			it("should do nothing for investment accounts", function() {
				transactionIndexController.context.account_type = "investment";
				transactionIndexController.updateRunningBalances();
				transactionIndexController.transactions.should.deep.equal(transactionBatch.transactions);
			});

			it("should calculate a running balance on each transaction", function() {
				transactionIndexController.updateRunningBalances();
				transactionIndexController.transactions.pop().balance.should.equal(95);
			});
		});

		describe("focusTransaction", function() {
			beforeEach(function() {
				transactionIndexController.tableActions.focusRow = sinon.stub();
			});

			it("should do nothing when the specific transaction row could not be found", function() {
				(undefined === transactionIndexController.focusTransaction(999)).should.be.true;
				transactionIndexController.tableActions.focusRow.should.not.have.been.called;
			});

			it("should focus the transaction row for the specified transaction", function() {
				var targetIndex = transactionIndexController.focusTransaction(1);
				$timeout.flush();
				transactionIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
			});

			it("should return the index of the specified transaction", function() {
				var targetIndex = transactionIndexController.focusTransaction(1);
				targetIndex.should.equal(0);
			});
		});

		describe("(account context)", function() {
			//TODO
		});

		describe("toggleSubtransactions", function() {
			//TODO
		});

		describe("flag", function() {
			//TODO
		});

		describe("switchAccount", function() {
			//TODO
		});

		describe("switchPrimaryAccount", function() {
			//TODO
		});

		describe("switchPayee", function() {
			//TODO
		});

		describe("switchSecurity", function() {
			//TODO
		});

		describe("switchCategory", function() {
			//TODO
		});

		describe("swithSubcategory", function() {
			//TODO
		});

		describe("stateChangeSuccessHandler", function() {
			var toState,
					toParams,
					fromState,
					fromParams;

			beforeEach(function() {
				toState = {name: "state"};
				toParams = {id: 1, transactionId: 1};
				fromState = angular.copy(toState);
				fromParams = angular.copy(toParams);
				sinon.stub(transactionIndexController, "focusTransaction");
				sinon.stub(transactionModel, "find");
			});

			it("should do nothing when a transaction id state parameter is not specified", function() {
				delete toParams.transactionId;
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusTransaction.should.not.have.been.called;
			});

			it("should do nothing when state parameters have not changed", function() {
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusTransaction.should.not.have.been.called;
			});

			it("should ensure the transaction is focussed when the state name changes", function() {
				toState.name = "new state";
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusTransaction.should.have.been.calledWith(toParams.transactionId);
			});

			it("should ensure the transaction is focussed when the id state param changes", function() {
				toParams.id = 2;
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusTransaction.should.have.been.calledWith(toParams.transactionId);
			});

			it("should ensure the transaction is focussed when the transaction id state param changes", function() {
				toParams.transactionId = 2;
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusTransaction.should.have.been.calledWith(toParams.transactionId);
			});

			describe("(transaction not found)", function() {
				//TODO
			});
		});

		it("should attach a state change success handler", function() {
			sinon.stub(transactionIndexController, "stateChangeSuccessHandler");
			transactionIndexController.$emit("$stateChangeSuccess");
			transactionIndexController.stateChangeSuccessHandler.should.have.been.called;
		});
	});
})();
