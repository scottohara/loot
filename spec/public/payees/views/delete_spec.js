describe("payeeDeleteView", () => {
	let	payeeIndexView,
			payeeDeleteView,
			originalRowCount,
			lastPayeeName,
			secondLastPayeeName;

	beforeEach(() => {
		payeeIndexView = require("./index");
		payeeDeleteView = require("./delete");

		// Go to the payees index page
		browser.get("/#!/payees");
		browser.wait(protractor.ExpectedConditions.presenceOf(payeeIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		payeeIndexView.table.rows.count().then(count => (originalRowCount = count));

		payeeIndexView.payeeName(payeeIndexView.table.lastRow()).then(payeeName => (lastPayeeName = payeeName));

		payeeIndexView.table.secondLastRow().then(payeeIndexView.payeeName.bind(payeeIndexView)).then(payeeName => (secondLastPayeeName = payeeName));
	});

	describe("deleting a payee", () => {
		beforeEach(() => {
			// Delete an existing payee
			payeeIndexView.deletePayee(originalRowCount - 1);
			browser.wait(payeeDeleteView.isPresent.bind(payeeDeleteView), 3000, "Timeout waiting for view to render");
		});

		it("should display the details of the payee being deleted", () => payeeDeleteView.payeeName().should.eventually.equal(lastPayeeName));

		it("should not save changes when the cancel button is clicked", () => {
			payeeDeleteView.cancel();

			// Row count should not have changed
			payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Payee in the last row should not have changed
			payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(lastPayeeName);
		});

		it("should delete an existing payee when the delete button is clicked", () => {
			payeeDeleteView.del();

			// Row count should have decremented by one
			payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount - 1);

			// Payee previously in the 2nd last row should now be in the last row
			payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(secondLastPayeeName);
		});

		// MISSING - error message should display when present
	});
});
