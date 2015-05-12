(function() {
	"use strict";

	/*jshint expr: true */

	describe("AccountIndexController", function() {
		// The object under test
		var accountIndexController;

		// Dependencies
		var	$modal,
				accountModel,
				accountsWithBalances;

		// Load the modules
		beforeEach(module("lootMocks", "lootAccounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modal", "accountModel", "accountsWithBalances"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_$modal_, controllerTest, _accountModel_, _accountsWithBalances_) {
			$modal = _$modal_;
			accountModel = _accountModel_;
			accountsWithBalances = _accountsWithBalances_;
			accountIndexController = controllerTest("AccountIndexController", {"accounts": accountsWithBalances});
		}));

		it("should make the account list available to the view", function() {
			accountIndexController.accounts.should.equal(accountsWithBalances);
		});

		it("should calculate the net worth by summing the account type totals", function() {
			accountIndexController.netWorth.should.equal(200);
		});

		describe("editAccount", function() {
			var account;

			beforeEach(function() {
				account = angular.copy(accountIndexController.accounts["Bank accounts"].accounts[1]);
				sinon.stub(accountIndexController, "calculateNetWorth");
				sinon.stub(accountIndexController, "calculateAccountTypeTotal");
			});

			describe("(edit existing)", function() {
				beforeEach(function() {
					accountIndexController.editAccount("Bank accounts", 1);
				});

				it("should open the edit account modal with an account", function() {
					$modal.open.should.have.been.called;
					accountModel.addRecent.should.have.been.calledWith(account);
					$modal.resolves.account.should.deep.equal(account);
				});

				describe("(account type changed)", function() {
					beforeEach(function() {
						account.account_type = "investment";
						$modal.close(account);
					});

					it("should remove the account from original account type's list", function() {
						accountIndexController.accounts["Bank accounts"].accounts.should.not.include(account);
					});

					it("should recalculate the original account type total", function() {
						accountIndexController.calculateAccountTypeTotal.should.have.been.calledWith("Bank accounts");
					});

					it("should add the account to the new account type's list", function() {
						accountIndexController.accounts["Investment accounts"].accounts.should.include(account);
					});
				});
				
				it("should update the account in the list of accounts when the modal is closed", function() {
					account.name = "edited account";
					$modal.close(account);
					accountIndexController.accounts["Bank accounts"].accounts.should.include(account);
				});
			});

			describe("(add new)", function() {
				beforeEach(function() {
					account = {id: 999, name: "new account", account_type: "bank"};
					accountIndexController.editAccount();
				});

				it("should open the edit account modal without an account", function() {
					$modal.open.should.have.been.called;
					accountModel.addRecent.should.not.have.been.called;
					(undefined === $modal.resolves.account).should.be.true;
				});

				it("should add the new account to the list of accounts when the modal is closed", function() {
					$modal.close(account);
					accountIndexController.accounts["Bank accounts"].accounts.pop().should.deep.equal(account);
				});

				it("should add the new account to the recent list", function() {
					$modal.close(account);
					accountModel.addRecent.should.have.been.calledWith(account);
				});
			});

			it("should resort the accounts list when the modal is closed", function() {
				var accountWithHighestName = angular.copy(accountIndexController.accounts["Bank accounts"].accounts[2]);
				accountIndexController.editAccount();
				$modal.close(account);
				accountIndexController.accounts["Bank accounts"].accounts.pop().should.deep.equal(accountWithHighestName);
			});

			it("should recalculate the account type total when the modal is closed", function() {
				accountIndexController.editAccount();
				$modal.close(account);
				accountIndexController.calculateAccountTypeTotal.should.have.been.calledWith("Bank accounts");
			});

			it("should recalculate the net worth when the modal is closed", function() {
				accountIndexController.editAccount();
				$modal.close(account);
				accountIndexController.calculateNetWorth.should.have.been.called;
			});

			it("should not change the accounts list when the modal is dismissed", function() {
				var originalAccounts = angular.copy(accountIndexController.accounts);
				accountIndexController.editAccount();
				$modal.dismiss();
				accountIndexController.accounts.should.deep.equal(originalAccounts);
			});
		});

		describe("deleteAccount", function() {
			var account;

			beforeEach(function() {
				account = angular.copy(accountIndexController.accounts["Bank accounts"].accounts[1]);
				sinon.stub(accountIndexController, "calculateNetWorth");
				sinon.stub(accountIndexController, "calculateAccountTypeTotal");
			});

			it("should fetch the account", function() {
				accountIndexController.deleteAccount("Bank accounts", 1);
				accountModel.find.should.have.been.calledWith(account.id);
			});

			it("should show an alert if the account has transactions", function() {
				accountIndexController.deleteAccount("Bank accounts", 2);
				$modal.open.should.have.been.called;
				$modal.resolves.alert.header.should.equal("Account has existing transactions");
			});

			it("should show the delete account modal if the account has no transactions", function() {
				accountIndexController.deleteAccount("Bank accounts", 1);
				$modal.open.should.have.been.called;
				$modal.resolves.account.should.deep.equal(account);
			});

			it("should remove the account from the accounts list when the modal is closed", function() {
				accountIndexController.deleteAccount("Bank accounts", 1);
				$modal.close(account);
				accountIndexController.accounts["Bank accounts"].accounts.should.not.include(account);
			});

			it("should recalculate the account type total when the modal is closed", function() {
				accountIndexController.deleteAccount("Bank accounts", 1);
				$modal.close(account);
				accountIndexController.calculateAccountTypeTotal.should.have.been.calledWith("Bank accounts");
			});

			it("should recalculate the net worth when the modal is closed", function() {
				accountIndexController.deleteAccount("Bank accounts", 1);
				$modal.close(account);
				accountIndexController.calculateNetWorth.should.have.been.called;
			});
		});

		describe("keyHandler", function() {
			var INSERT_KEY = 45,
					N_KEY = 78,
					event;

			beforeEach(function() {
				event = {
					keyCode: 13,
					preventDefault: sinon.stub()
				};
				sinon.stub(accountIndexController, "editAccount");
			});

			it("should invoke editAccount() with no account when the Insert key is pressed", function() {
				event.keyCode = INSERT_KEY;
				event.ctrlKey = false;
				accountIndexController.keyHandler(event);
				accountIndexController.editAccount.should.have.been.called;
				event.preventDefault.should.have.been.called;
			});

			it("should invoke editAccount() with no account when the CTRL+N keys are pressed", function() {
				event.keyCode = N_KEY;
				event.ctrlKey = true;
				accountIndexController.keyHandler(event);
				accountIndexController.editAccount.should.have.been.called;
				event.preventDefault.should.have.been.called;
			});

			it("should do nothing when any other keys are pressed", function() {
				accountIndexController.keyHandler(event);
				accountIndexController.editAccount.should.not.have.been.called;
				event.preventDefault.should.not.have.been.called;
			});
		});

		it("should attach a keydown handler to the document", function() {
			sinon.stub(accountIndexController, "keyHandler");
			$(document).triggerHandler("keydown");
			accountIndexController.keyHandler.should.have.been.called;
		});

		describe("on destroy", function() {
			beforeEach(function() {
				sinon.stub(accountIndexController, "keyHandler");
				accountIndexController.$scope.$emit("$destroy");
			});

			it("should remove the keydown handler from the document", function() {
				$(document).triggerHandler("keydown");
				accountIndexController.keyHandler.should.not.have.been.called;
			});
		});

		describe("calculateAccountTypeTotal", function() {
			it("should sum the closing balances of all accounts of a specified type", function() {
				var originalTotal = accountIndexController.accounts["Bank accounts"].total;
				accountIndexController.accounts["Bank accounts"].accounts[0].closing_balance += 10;
				accountIndexController.calculateAccountTypeTotal("Bank accounts");
				accountIndexController.accounts["Bank accounts"].total.should.equal(originalTotal + 10);
			});
		});
	});
})();
