describe("securityDeleteView", () => {
	let	securityIndexView,
			securityDeleteView,
			originalRowCount,
			lastSecurityName,
			lastSecurityCode,
			secondLastSecurityName;

	beforeEach(() => {
		securityIndexView = require("./index");
		securityDeleteView = require("./delete");

		// Go to the securities index page
		browser.get("/#!/securities");
		browser.wait(protractor.ExpectedConditions.presenceOf(securityIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		securityIndexView.table.rows.count().then(count => (originalRowCount = count));

		securityIndexView.securityName(securityIndexView.table.lastRow()).then(securityName => (lastSecurityName = securityName));

		securityIndexView.securityCode(securityIndexView.table.lastRow()).then(securityCode => (lastSecurityCode = securityCode));

		securityIndexView.table.secondLastRow().then(securityIndexView.securityName).then(securityName => (secondLastSecurityName = securityName));
	});

	describe("deleting a security", () => {
		beforeEach(() => {
			// Delete an existing security
			securityIndexView.deleteSecurity(originalRowCount - 1);
			browser.wait(securityDeleteView.isPresent.bind(securityDeleteView), 3000, "Timeout waiting for view to render");
		});

		it("should display the details of the security being deleted", () => {
			securityDeleteView.securityName().should.eventually.equal(lastSecurityName.replace("\nNo transactions", ""));
			securityDeleteView.securityCode().should.eventually.equal(lastSecurityCode);
		});

		it("should not save changes when the cancel button is clicked", () => {
			securityDeleteView.cancel();

			// Row count should not have changed
			securityIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Security in the last row should not have changed
			securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(lastSecurityName);
		});

		it("should delete an existing security when the delete button is clicked", () => {
			securityDeleteView.del();

			// Row count should have decremented by one
			securityIndexView.table.rows.count().should.eventually.equal(originalRowCount - 1);

			// Security previously in the 2nd last row should now be in the last row
			securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(secondLastSecurityName);
		});

		// MISSING - error message should display when present
	});
});
