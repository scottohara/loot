(function() {
	"use strict";

	function AccountIndexView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.accountTypeTables = element.all(by.repeater("(type, accountType) in vm.accounts"));
		view.accountTypeTable = accountTypeTable;
		view.accountTypeTableHeading = accountTypeTableHeading;
		view.accountTypeAccounts = accountTypeAccounts;
		view.account = account;
		view.accountName = accountName;
		view.cashAccountLink = cashAccountLink;
		view.editAccountButton = editAccountButton;
		view.deleteAccountButton = deleteAccountButton;
		view.accountClosingBalance = accountClosingBalance;
		view.accountTypeTableTotal = accountTypeTableTotal;
		view.total = element(by.binding("vm.netWorth")).getText();
		view.closedAccounts = element.all(by.css("tr.closed-account"));
		view.negativeBalances = element.all(by.css(".amount.text-danger"));

		/**
		 * Behaviours
		 */
		view.goToAccount = goToAccount;
		view.goToCashAccount = goToCashAccount;
		view.addAccount = addAccount;
		view.editAccount = editAccount;
		view.deleteAccount = deleteAccount;

		function accountTypeTable(accountType) {
			return view.accountTypeTables.filter(function(table) {
				return view.accountTypeTableHeading(table).then(function(heading) {
					return accountType + " accounts" === heading;
				});
			}).first();
		}

		function accountTypeTableHeading(table) {
			return table.element(by.binding("::type")).getText();
		}

		function accountTypeAccounts(table) {
			return table.all(by.repeater("account in accountType.accounts"));
		}

		function account(accounts, index) {
			return accounts.get(index);
		}

		function accountName(row) {
			return row.element(by.binding("::account.name")).getText();
		}

		function cashAccountLink(row) {
			return row.element(by.linkText("Cash"));
		}

		function editAccountButton(row) {
			return row.element(by.css("i.glyphicon-edit"));
		}

		function deleteAccountButton(row) {
			return row.element(by.css("i.glyphicon-trash"));
		}

		function accountClosingBalance(row) {
			return row.element(by.binding("::account.closing_balance")).getText();
		}

		function accountTypeTableTotal(table) {
			return table.element(by.binding("accountType.total")).getText();
		}

		// Click on an account link
		function goToAccount(accountName) {
			element(by.linkText(accountName)).click();
		}

		// Click on a cash account link
		function goToCashAccount(accountName) {
			element(by.cssContainingText("tr", accountName)).element(by.linkText("Cash")).click();
		}

		// Create a new account
		function addAccount() {
			view.total.ctrlN();
		}

		// Edit an account
		function editAccount(row) {
			view.editAccountButton(row).click();
		}

		// Delete an account
		function deleteAccount(row) {
			view.deleteAccountButton(row).click();
		}
	}

	module.exports = new AccountIndexView();
})();
