{
	class LayoutView {
		constructor() {
			this.notLoggedInMessage = element(by.cssContainingText("div", "You are not logged in. Click the Login button above to proceed."));
			this.uiView = element(by.css("ui-view"));

			// MISSING
			this.homeButton = element(by.cssContainingText(".navbar-brand", "Loot"));
			this.accountsMenu = element(by.cssContainingText(".dropdown-toggle", "Accounts"));
			this.accountListMenuItem = element(by.cssContainingText("a", "Account List"));
			this.recentAccountMenuItems = element.all(by.repeater("account in recentlyAccessedAccounts()"));
			this.schedulesMenu = element(by.cssContainingText("a", "Schedules"));
			this.payeesMenu = element(by.cssContainingText(".dropdown-toggle", "Payees"));
			this.payeeListMenuItem = element(by.cssContainingText("a", "Payee List"));
			this.recentPayeeMenuItems = element.all(by.repeater("payee in recentlyAccessedPayees()"));
			this.categoriesMenu = element(by.cssContainingText(".dropdown-toggle", "Categories"));
			this.categoryListMenuItem = element(by.cssContainingText("a", "Category List"));
			this.recentCategoryMenuItems = element.all(by.repeater("account in recentlyAccessedCategories()"));
			this.securitiesMenu = element(by.cssContainingText(".dropdown-toggle", "Securities"));
			this.securityListMenuItem = element(by.cssContainingText("a", "Security List"));
			this.recentSecurityMenuItems = element.all(by.repeater("account in recentlyAccessedSecurities()"));
			this.loginButton = element(by.buttonText("Login"));
			this.logoutButton = element(by.buttonText("Logout"));
			this.searchInput = element(by.model("$root.query"));
			this.searchButton = element(by.css(".btn .btn-default"));
			this.scrollToTopLink = element(by.css(".quickscroll .top"));
			this.scrollToBottomLink = element(by.css(".quickscroll .bottom"));
		}

		// Search
		search(query, trigger) {
			this.searchInput.clear().click().sendKeys(query);

			switch (trigger) {

				// Send Enter key while the search input has focus
				case "enterInput":
					this.searchInput.sendKeys(protractor.Key.ENTER);
					break;

				// Send Enter key while the search button has focus
				case "enterButton":
					this.searchButton.sendKeys(protractor.Key.ENTER);
					break;

				// Click the search button
				default:
					this.searchButton.click();
					break;
			}
		}
	}

	module.exports = new LayoutView();
}
