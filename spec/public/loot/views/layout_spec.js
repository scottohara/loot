/* Not implemented yet
describe.skip("layoutView", () => {
	const layoutView = require("./layout.js");

	it("should navigate to the accounts list when the home button is clicked", () => {
		layoutView.homeButton.click();
		browser.getCurrentUrl().should.eventually.equal(`${browser.baseUrl}#!/accounts`);
	});

	describe("accounts menu", () => {
		it("should show the accounts menu items when clicked", () => {
			layoutView.accountsMenu.click();
			layoutView.accountListMenuItem.isDisplayed().should.eventually.be.true;
		});

		it("should navigate to the accounts list when the list item is clicked", () => {
			layoutView.accountListMenuItem.click();
			browser.getTitle().should.eventually.equal("Loot - Accounts");
		});

		describe("recent accounts", () => {
			const oldestItem = layoutView.recentAccountMenuItems.last();

			it("should navigate to the account ledger when clicked", () => {
				oldestItem.click();
				browser.getTitle().should.eventually.equal("Loot - Account Transactions");
			});

			it("should move the account to the top of the recent list when clicked", () => {
				layoutView.recentAccountMenuItems.first().getText().should.eventually.equal(oldestItem.getText());
				browser.getTitle().should.eventually.equal("Loot - Account Transactions");
			});
		});
	});
});
*/
