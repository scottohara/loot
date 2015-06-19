describe("authenticationEditView", () => {
	let	authenticationEditView,
			layoutView;

	beforeEach(() => {
		authenticationEditView = require("./edit");
		layoutView = require("../../loot/views/layout");

		// Go to the site root
		browser.get("/");
		browser.wait(protractor.ExpectedConditions.presenceOf(authenticationEditView.loginForm), 3000, "Timeout waiting for view to render");
	});

	it("should not login if the credentials are invalid", () => {
		authenticationEditView.login("baduser", "badpassword");
		authenticationEditView.errorMessage.getText().should.eventually.equal("Invalid login and/or password");
	});

	it("should not login when the cancel button is clicked", () => {
		authenticationEditView.cancel();
		browser.wait(protractor.ExpectedConditions.stalenessOf(authenticationEditView.loginForm), 3000, "Timeout waiting for view to close");
		layoutView.notLoggedInMessage.isPresent().should.eventually.be.true;
		layoutView.uiView.isPresent().should.eventually.be.false;
	});

	it("should login if the credentials are valid", () => {
		authenticationEditView.login(browser.params.login.userName, browser.params.login.password);
		browser.wait(protractor.ExpectedConditions.stalenessOf(authenticationEditView.loginForm), 3000, "Timeout waiting for view to close");
		layoutView.notLoggedInMessage.isPresent().should.eventually.be.false;
		layoutView.uiView.isPresent().should.eventually.be.true;
	});
});
