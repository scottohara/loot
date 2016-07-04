describe("payeeEditView", () => {
	let	payeeIndexView,
			payeeEditView,
			expected,
			originalRowCount,
			lastPayeeName;

	function waitForPayeeEditView(mode) {
		browser.wait(payeeEditView.isPresent.bind(payeeEditView), 3000, "Timeout waiting for view to render");
		payeeEditView.heading().should.eventually.equal(`${mode} Payee`);
	}

	function commonBehaviour() {
		it("should not save changes when the cancel button is clicked", () => {
			payeeEditView.cancel();

			// Row count should not have changed
			payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Payee in the last row should not have changed
			payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(lastPayeeName);
		});

		describe("invalid data", () => {
			beforeEach(() => payeeEditView.clearPayeeDetails());

			it("should not enable the save button", () => payeeEditView.saveButton.isEnabled().should.eventually.be.false);

			// MISSING - payee name should show red cross when invalid
			// MISSING - form group around payee name should have 'has-error' class when invalid
		});

		// MISSING - error message should display when present
		// MISSING - payee name text should be selected when input gets focus
	}

	beforeEach(() => {
		payeeIndexView = require("./index");
		payeeEditView = require("./edit");

		// Go to the payees index page
		browser.get("/index.html#/payees");
		browser.wait(protractor.ExpectedConditions.presenceOf(payeeIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		payeeIndexView.table.rows.count().then(count => (originalRowCount = count));

		payeeIndexView.payeeName(payeeIndexView.table.lastRow()).then(payeeName => (lastPayeeName = payeeName));
	});

	describe("adding a payee", () => {
		beforeEach(() => {
			expected = "Test payee";

			// Add a new payee
			payeeIndexView.addPayee();
			waitForPayeeEditView("Add");
			payeeEditView.enterPayeeDetails({payeeName: expected});
		});

		commonBehaviour();

		it("should insert a new payee when the save button is clicked", () => {
			payeeEditView.save();

			// Row count should have incremented by one
			payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

			// Payee in the last row should be the new payee
			payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(expected);
		});
	});

	describe("editing a payee", () => {
		beforeEach(() => {
			expected = "Test payee (edited)";

			// Edit an existing payee
			payeeIndexView.editPayee(originalRowCount - 1);
			waitForPayeeEditView("Edit");
			payeeEditView.payeeNameInput.getAttribute("value").should.eventually.equal(lastPayeeName);
			payeeEditView.enterPayeeDetails({payeeName: expected});
		});

		commonBehaviour();

		it("should update an existing payee when the save button is clicked", () => {
			payeeEditView.save();

			// Row count should not have changed
			payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Payee in the last row should be the new payee
			payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(expected);
		});
	});
});
