class AccountIndexView {
	constructor() {
		this.accountTypeTables = element.all(by.repeater("(type, accountType) in vm.accounts"));
		this.total = element(by.binding("vm.netWorth")).getText();
		this.closedAccounts = element.all(by.css("tr.closed-account"));
		this.negativeBalances = element.all(by.css(".amount.text-danger"));
	}

	accountTypeTableHeading(table) {
		return table.element(by.binding("::type")).getText();
	}

	accountTypeAccounts(table) {
		return table.all(by.repeater("account in accountType.accounts"));
	}

	accountName(row) {
		return row.element(by.binding("::account.name")).getText();
	}

	cashAccountLink(row) {
		return row.element(by.linkText("Cash"));
	}

	accountClosingBalance(row) {
		return row.element(by.binding("::account.closing_balance")).getText();
	}

	accountTypeTableTotal(table) {
		return table.element(by.binding("accountType.total")).getText();
	}

	// Click on an account link
	goToAccount(accountName) {
		element(by.linkText(accountName)).click();
	}

	// Click on a cash account link
	goToCashAccount(accountName) {
		element(by.cssContainingText("tr", accountName)).element(by.linkText("Cash")).click();
	}
}

module.exports = new AccountIndexView();