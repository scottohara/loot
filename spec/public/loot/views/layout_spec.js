(function() {
	"use strict";

	/*jshint expr: true */

	/*describe.skip("layoutView", function() {
		var layoutView = require("./layout.js");

		it("should navigate to the accounts list when the home button is clicked", function() {
			layoutView.homeButton.click();
			browser.getCurrentUrl().should.eventually.equal(browser.baseUrl + "#/accounts");
		});

		describe("accounts menu", function() {
			it("should show the accounts menu items when clicked", function() {
				layoutView.accountsMenu.click();
				layoutView.accountListMenuItem.isDisplayed().should.eventually.be.true;
			});

			it("should navigate to the accounts list when the list item is clicked", function() {
				layoutView.accountListMenuItem.click();
				browser.getTitle().should.eventually.equal("Loot - Accounts");
			});

			describe("recent accounts", function() {
				var oldestItem = layoutView.recentAccountMenuItems.last();

				it("should navigate to the account ledger when clicked", function() {
					oldestItem.click();
					browser.getTitle().should.eventually.equal("Loot - Account Transactions");
				});

				it("should move the account to the top of the recent list when clicked", function() {
					layoutView.recentAccountMenuItems.first().getText().should.eventually.equal(oldestItem.getText());
					browser.getTitle().should.eventually.equal("Loot - Account Transactions");
				});
			});
		});
	});*/
})();
