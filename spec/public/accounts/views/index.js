(function() {
	"use strict";

	function AccountIndexView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.accountTypeTables = element.all(by.repeater("(type, accountType) in vm.accounts"));
		view.accountTypeTableHeading = accountTypeTableHeading;
		view.accountTypeAccounts = accountTypeAccounts;
		view.accountName = accountName;
		view.cashAccountLink = cashAccountLink;
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

		function accountTypeTableHeading(table) {
			return table.element(by.binding("::type")).getText();
		}

		function accountTypeAccounts(table) {
			return table.all(by.repeater("account in accountType.accounts"));
		}

		function accountName(row) {
			return row.element(by.binding("::account.name")).getText();
		}

		function cashAccountLink(row) {
			return row.element(by.linkText("Cash"));
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
	}

	module.exports = new AccountIndexView();
})();
