describe("securityEditView", () => {
	let	securityIndexView,
			securityEditView,
			expected,
			originalRowCount,
			lastSecurityName,
			lastSecurityCode;

	function waitForSecurityEditView(mode) {
		browser.wait(securityEditView.isPresent.bind(securityEditView), 3000, "Timeout waiting for view to render");
		securityEditView.heading().should.eventually.equal(`${mode} Security`);
	}

	function commonBehaviour() {
		it("should not save changes when the cancel button is clicked", () => {
			securityEditView.cancel();

			// Row count should not have changed
			securityIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Security in the last row should not have changed
			securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(lastSecurityName);
			securityIndexView.securityCode(securityIndexView.table.lastRow()).should.eventually.equal(lastSecurityCode);
		});

		describe("invalid data", () => {
			beforeEach(() => securityEditView.clearSecurityDetails());

			it("should not enable the save button", () => securityEditView.saveButton.isEnabled().should.eventually.be.false);

			// MISSING - security name should show red cross when invalid
			// MISSING - form group around security name should have 'has-error' class when invalid
		});

		// MISSING - error message should display when present
		// MISSING - security name text should be selected when input gets focus
	}

	beforeEach(() => {
		securityIndexView = require("./index");
		securityEditView = require("./edit");

		// Go to the securities index page
		browser.get("/index.html#/securities");
		browser.wait(protractor.ExpectedConditions.presenceOf(securityIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		securityIndexView.table.rows.count().then(count => originalRowCount = count);

		securityIndexView.securityName(securityIndexView.table.lastRow()).then(securityName => lastSecurityName = securityName);

		securityIndexView.securityCode(securityIndexView.table.lastRow()).then(securityCode => lastSecurityCode = securityCode);
	});

	describe("adding a security", () => {
		beforeEach(() => {
			expected = {name: "Test security", code: "TEST"};

			// Add a new security
			securityIndexView.addSecurity();
			waitForSecurityEditView("Add");
			securityEditView.enterSecurityDetails({securityName: expected.name, securityCode: expected.code});
		});

		commonBehaviour();

		it("should insert a new security when the save button is clicked", () => {
			securityEditView.save();

			// Row count should have incremented by one
			securityIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

			// Security in the last row should be the new security
			securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(`${expected.name}\nNo transactions`);
			securityIndexView.securityCode(securityIndexView.table.lastRow()).should.eventually.equal(expected.code);
		});
	});

	describe("editing a security", () => {
		beforeEach(() => {
			expected = {name: "Test security (edited)", code: "TEST2"};

			// Edit an existing security
			securityIndexView.editSecurity(originalRowCount - 1);
			waitForSecurityEditView("Edit");
			securityEditView.securityNameInput.getAttribute("value").should.eventually.equal(lastSecurityName.replace("\nNo transactions", ""));
			securityEditView.securityCodeInput.getAttribute("value").should.eventually.equal(lastSecurityCode);
			securityEditView.enterSecurityDetails({securityName: expected.name, securityCode: expected.code});
		});

		commonBehaviour();

		it("should update an existing security when the save button is clicked", () => {
			securityEditView.save();

			// Row count should not have changed
			securityIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Security in the last row should be the new security
			securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(`${expected.name}\nNo transactions`);
			securityIndexView.securityCode(securityIndexView.table.lastRow()).should.eventually.equal(expected.code);
		});
	});
});
