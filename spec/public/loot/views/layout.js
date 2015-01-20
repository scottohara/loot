(function() {
	"use strict";

	function LayoutView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.notLoggedInMessage = element(by.cssContainingText("div", "You are not logged in. Click the Login button above to proceed."));
		view.uiView = element(by.css("ui-view"));

		//TODO
		view.homeButton = element(by.cssContainingText(".navbar-brand", "Loot"));
		view.accountsMenu = element(by.cssContainingText(".dropdown-toggle", "Accounts"));
		view.accountListMenuItem = element(by.cssContainingText("a", "Account List"));
		view.recentAccountMenuItems = element.all(by.repeater("account in recentlyAccessedAccounts()"));
		view.schedulesMenu = element(by.cssContainingText("a", "Schedules"));
		view.payeesMenu = element(by.cssContainingText(".dropdown-toggle", "Payees"));
		view.payeeListMenuItem = element(by.cssContainingText("a", "Payee List"));
		view.recentPayeeMenuItems = element.all(by.repeater("payee in recentlyAccessedPayees()"));
		view.categoriesMenu = element(by.cssContainingText(".dropdown-toggle", "Categories"));
		view.categoryListMenuItem = element(by.cssContainingText("a", "Category List"));
		view.recentCategoryMenuItems = element.all(by.repeater("account in recentlyAccessedCategories()"));
		view.securitiesMenu = element(by.cssContainingText(".dropdown-toggle", "Securities"));
		view.securityListMenuItem = element(by.cssContainingText("a", "Security List"));
		view.recentSecurityMenuItems = element.all(by.repeater("account in recentlyAccessedSecurities()"));
		view.loginButton = element(by.buttonText("Login"));
		view.logoutButton = element(by.buttonText("Logout"));
		view.searchInput = element(by.model("$root.query"));
		view.searchButton = element(by.css(".btn .btn-default"));
		view.scrollToTopLink = element(by.css(".quickscroll .top"));
		view.scrollToBottomLink = element(by.css(".quickscroll .bottom"));

		/**
		 * Behaviours
		 */
		view.search = search;

		// Search
		function search(query, trigger) {
			view.searchInput.sendKeys(query);

			switch (trigger) {
				// Send Enter key while the search input has focus
				case "enterInput":
					view.searchInput.sendKeys(protractor.Key.ENTER);
					break;

				// Send Enter key while the search button has focus
				case "enterButton":
					view.searchButton.sendKeys(protractor.Key.ENTER);
					break;

				// Click the search button
				default:
					view.searchButton.click();
					break;
			}
		}
	}

	module.exports = new LayoutView();
})();

