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
		beforeEach(inject(function(_controllerTest_, _$modal_, _$timeout_, _$window_, _$state_, _transactionModel_, _accountModel_, _contextModel_, _context_, _transactionBatch_) {
			controllerTest = _controllerTest_;
			$modal = _$modal_;
			$timeout = _$timeout_;
			$window = _$window_;
			$state = _$state_;
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
			var transaction;

			beforeEach(function() {
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

			/*describe("(add new)", function() {
				beforeEach(function() {
					payee = {id: 999, name: "new payee"};
					transactionIndexController.editPayee();
				});

				it("should open the edit payee modal without a payee", function() {
					$modal.open.should.have.been.called;
					payeeModel.addRecent.should.not.have.been.called;
					(undefined === $modal.resolves.payee).should.be.true;
				});

				it("should add the new payee to the list of payees when the modal is closed", function() {
					$modal.close(payee);
					transactionIndexController.payees.pop().should.deep.equal(payee);
				});

				it("should add the new payee to the recent list", function() {
					$modal.close(payee);
					payeeModel.addRecent.should.have.been.calledWith(payee);
				});
			});*/

			/*it("should resort the payees list when the modal is closed", function() {
				var payeeWithHighestName = angular.copy(transactionIndexController.payees[2]);
				transactionIndexController.editPayee();
				$modal.close(payee);
				transactionIndexController.payees.pop().should.deep.equal(payeeWithHighestName);
			});*/

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

		/*describe("deletePayee", function() {
			var payee;

			beforeEach(function() {
				payee = angular.copy(transactionIndexController.payees[1]);
			});

			it("should fetch the payee", function() {
				transactionIndexController.deletePayee(1);
				payeeModel.find.should.have.been.calledWith(payee.id);
			});

			it("should disable navigation on the table", function() {
				transactionIndexController.deletePayee(1);
				transactionIndexController.navigationDisabled.should.be.true;
			});

			it("should show an alert if the payee has transactions", function() {
				transactionIndexController.deletePayee(2);
				$modal.open.should.have.been.called;
				$modal.resolves.alert.header.should.equal("Payee has existing transactions");
			});

			it("should show the delete payee modal if the payee has no transactions", function() {
				transactionIndexController.deletePayee(1);
				$modal.open.should.have.been.called;
				$modal.resolves.payee.should.deep.equal(payee);
			});

			it("should remove the payee from the payees list when the modal is closed", function() {
				transactionIndexController.deletePayee(1);
				$modal.close(payee);
				transactionIndexController.payees.should.not.include(payee);
			});

			it("should transition to the payees list when the modal is closed", function() {
				transactionIndexController.deletePayee(1);
				$modal.close(payee);
				$state.go.should.have.been.calledWith("root.payees");
			});

			it("should enable navigation on the table when the modal is closed", function() {
				transactionIndexController.deletePayee(1);
				$modal.close(payee);
				transactionIndexController.navigationDisabled.should.be.false;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				transactionIndexController.deletePayee(1);
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
			it("should transition to the payee transactions list", function() {
				transactionIndexController.tableActions.selectAction();
				$state.go.should.have.been.calledWith(".transactions");
			});
		});

		describe("tableActions.editAction", function() {
			it("should edit the payee", function() {
				transactionIndexController.tableActions.editAction.should.equal(transactionIndexController.editPayee);
			});
		});

		describe("tableActions.insertAction", function() {
			it("should insert a payee", function() {
				sinon.stub(transactionIndexController, "editPayee");
				transactionIndexController.tableActions.insertAction();
				transactionIndexController.editPayee.should.have.been.calledWith(undefined);
			});
		});

		describe("tableActions.deleteAction", function() {
			it("should delete a payee", function() {
				transactionIndexController.tableActions.deleteAction.should.equal(transactionIndexController.deletePayee);
			});
		});

		describe("tableActions.focusAction", function() {
			it("should focus a payee when no payee is currently focussed", function() {
				transactionIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith(".payee", {id: 2});
			});

			it("should focus a payee when another payee is currently focussed", function() {
				$state.currentState("**.payee");
				transactionIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith("^.payee", {id: 2});
			});
		});

		describe("focusPayee", function() {
			beforeEach(function() {
				transactionIndexController.tableActions.focusRow = sinon.stub();
			});

			it("should do nothing when the specific payee row could not be found", function() {
				(undefined === transactionIndexController.focusPayee(999)).should.be.true;
				transactionIndexController.tableActions.focusRow.should.not.have.been.called;
			});

			it("should focus the payee row for the specified payee", function() {
				var targetIndex = transactionIndexController.focusPayee(1);
				$timeout.flush();
				transactionIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
			});

			it("should return the index of the specified payee", function() {
				var targetIndex = transactionIndexController.focusPayee(1);
				targetIndex.should.equal(0);
			});
		});

		describe("stateChangeSuccessHandler", function() {
			var toState,
					toParams,
					fromState,
					fromParams;

			beforeEach(function() {
				toState = {name: "state"};
				toParams = {id: 1};
				fromState = angular.copy(toState);
				fromParams = angular.copy(toParams);
				sinon.stub(transactionIndexController, "focusPayee");
			});

			it("should do nothing when an id state parameter is not specified", function() {
				delete toParams.id;
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusPayee.should.not.have.been.called;
			});

			it("should do nothing when state parameters have not changed", function() {
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusPayee.should.not.have.been.called;
			});

			it("should ensure the payee is focussed when the state name changes", function() {
				toState.name = "new state";
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusPayee.should.have.been.calledWith(toParams.id);
			});

			it("should ensure the payee is focussed when the payee id state param changes", function() {
				toParams.id = 2;
				transactionIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				transactionIndexController.focusPayee.should.have.been.calledWith(toParams.id);
			});
		});

		it("should attach a state change success handler", function() {
			sinon.stub(transactionIndexController, "stateChangeSuccessHandler");
			transactionIndexController.$emit("$stateChangeSuccess");
			transactionIndexController.stateChangeSuccessHandler.should.have.been.called;
		});*/
	});
})();
