describe("payeeIndexView", () => {
	const payeeIndexView = require("./index");
	let expected;

	beforeEach(() => {
		expected = [];
		for (let i = 1; i <= 20; i++) {
			expected.push(`Payee ${i}`);
		}
		expected = expected.sort((a, b) => a.localeCompare(b));

		// Go to the payees index page
		browser.get("/#!/payees");
		browser.wait(protractor.ExpectedConditions.presenceOf(payeeIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
	});

	it("should display a row for each payee", () => {
		// Number of rows
		payeeIndexView.table.rows.count().should.eventually.equal(expected.length);

		payeeIndexView.table.rows.each((row, index) => {
			// Payee name
			payeeIndexView.payeeName(row).should.eventually.equal(expected[index]);

			// Edit button
			payeeIndexView.editButton(row).isPresent().should.eventually.be.true;
		});
	});

	payeeIndexView.table.behavesLikeNavigableTable();
});
