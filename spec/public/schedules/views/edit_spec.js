describe("scheduleEditView", () => {
	const moment = require("../../../../node_modules/moment/moment");
	let	scheduleIndexView,
			scheduleEditView,
			expected,
			originalRowCount,
			targetRow;

	// Waits for the edit view to appear and checks the heading is correct
	function waitForScheduleEditView(mode) {
		browser.wait(scheduleEditView.isPresent.bind(scheduleEditView), 3000, "Timeout waiting for view to render");
		scheduleEditView.heading().should.eventually.equal(`${mode} Schedule`);
	}

	// Ensures that the target row is scrolled into view
	function scrollIntoView(row) {
		browser.executeScript(scrollToRow => scrollToRow.scrollIntoView(), row.getWebElement());
	}

	// Cancel & form invalid behaviour
	function commonBehaviour() {
		it("should not save changes when the cancel button is clicked", () => {
			scheduleIndexView.getRowValues(targetRow).then(values => {
				scheduleEditView.cancel();

				// Row count should not have changed
				scheduleIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Schedule in the target row should not have changed
				scheduleIndexView.checkRowValues(targetRow, values);
			});
		});

		describe("invalid data", () => {
			beforeEach(() => scheduleEditView.clearScheduleDetails());

			it("should not enable the save button", () => scheduleEditView.saveButton.isEnabled().should.eventually.be.false);

			// MISSING - category name, parent & direction should show red cross when invalid
			// MISSING - form group around category name & parent should have 'has-error' class when invalid
			// MISSING - parent should behave like non-editable typeahead
		});

		// MISSING - error message should display when present
		// MISSING - category name & parent text should be selected when input gets focus
	}

	// Edits the target index row
	/*
	function editRow() {
		targetRow.evaluate("$index").then(index => {
			// Enter an existing schedule
			scheduleIndexView.enterSchedule(index);
			waitForScheduleEditView("Enter");
		});
	}
	*/

	// Checks the values in the edit form against the values from an index row
	/*
	function checkEditFormMatchesIndexRow(row) {
		scheduleIndexView.getRowValues(row).then(values => {
			// MISSING
			scheduleEditView.categoryNameInput.getAttribute("value").should.eventually.equal(values.categoryName);
			if (!values.isSubcategory) {
				scheduleEditView.directionRadioButton(values.direction, true).isPresent().should.eventually.be.true;
			} else {
				scheduleEditView.categoryParentInput.getAttribute("value").should.eventually.equal(values.categoryParent);
			}
		});
	}
	*/

	beforeEach(() => {
		scheduleIndexView = require("./index");
		scheduleEditView = require("./edit");

		// Go to the schedule index page
		browser.get("/index.html#/schedules");
		browser.wait(protractor.ExpectedConditions.presenceOf(scheduleIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		scheduleIndexView.table.rows.count().then(count => originalRowCount = count);
	});

	describe("adding a schedule", () => {
		const	tomorrow = moment().add(1, "days").format("DD/MM/YYYY"),
					schedules = [
						{
							primaryAccountName: "bank account 1",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							payeeName: "Payee 1",
							amount: 1,
							debitAmount: "~$1.00",
							categoryName: "Category 13",
							subcategoryName: "Category 15",
							memo: "Basic expense",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "bank account 1",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							payeeName: "Payee 1",
							amount: 1,
							creditAmount: "~$1.00",
							categoryName: "Category 1",
							subcategoryName: "Category 3",
							memo: "Basic income",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "bank account 1",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							payeeName: "Payee 1",
							amount: 1,
							debitAmount: "~$1.00",
							categoryName: "Transfer To",
							accountName: "bank account 2",
							memo: "Transfer",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "bank account 1",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							payeeName: "Payee 1",
							amount: 2,
							debitAmount: "~$2.00",
							categoryName: "Split To",
							subtransactions: [
								{
									categoryName: "Category 13",
									subcategoryName: "Category 15",
									memo: "Sub transaction",
									rawAmount: 1,
									amount: "$1.00"
								},
								{
									categoryName: "Category 13",
									subcategoryName: "Category 15",
									memo: "Sub transaction",
									rawAmount: 1,
									amount: "$1.00"
								}
							],
							memo: "Split",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "bank account 1",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							payeeName: "Payee 1",
							amount: 2,
							debitAmount: "~$2.00",
							categoryName: "Loan Repayment",
							subtransactions: [
								{
									categoryName: "Category 13",
									subcategoryName: "Category 15",
									memo: "Sub transaction",
									rawAmount: 1,
									amount: "$1.00"
								},
								{
									categoryName: "Category 13",
									subcategoryName: "Category 15",
									memo: "Sub transaction",
									rawAmount: 1,
									amount: "$1.00"
								}
							],
							memo: "Loan Repayment",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "bank account 1",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							payeeName: "Payee 1",
							amount: 2,
							creditAmount: "~$2.00",
							categoryName: "Payslip",
							subtransactions: [
								{
									categoryName: "Category 1",
									subcategoryName: "Category 3",
									memo: "Sub transaction",
									rawAmount: 1,
									amount: "$1.00"
								},
								{
									categoryName: "Category 1",
									subcategoryName: "Category 3",
									memo: "Sub transaction",
									rawAmount: 1,
									amount: "$1.00"
								}
							],
							memo: "Payslip",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							categoryName: "Buy",
							accountName: "bank account 6",
							quantity: 2,
							price: 1,
							commission: 1,
							amount: 3,
							creditAmount: "~$3.00",
							memo: "",
							memoFromInvestmentDetails: "2 @ $1.00 (plus $1.00 commission)",
							type: "Security Buy (no memo)",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							categoryName: "Buy",
							accountName: "bank account 6",
							quantity: 2,
							price: 1,
							commission: 1,
							amount: 3,
							creditAmount: "~$3.00",
							memo: "Security Buy",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							categoryName: "Sell",
							accountName: "bank account 6",
							quantity: 2,
							price: 1,
							commission: 1,
							amount: 1,
							debitAmount: "~$1.00",
							memo: "Security Sell",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							quantity: 1,
							categoryName: "Add Shares",
							memo: "Security Add",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							quantity: 1,
							categoryName: "Remove Shares",
							memo: "Security Remove",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							quantity: 1,
							categoryName: "Transfer To",
							accountName: "investment account 7",
							memo: "Security Transfer",
							isEstimate: true,
							isAutoEntered: true
						},
						{
							primaryAccountName: "investment account 5",
							frequency: "Monthly",
							nextDueDate: tomorrow,
							securityName: "Security 1",
							amount: 1,
							debitAmount: "~$1.00",
							categoryName: "Dividend To",
							accountName: "bank account 6",
							memo: "Dividend",
							isEstimate: true,
							isAutoEntered: true
						}
					];

		beforeEach(() => {
			// Add a new schedule
			scheduleIndexView.addSchedule();
			waitForScheduleEditView("Add");
			targetRow = scheduleIndexView.table.lastRow();
			scrollIntoView(targetRow);
		});

		schedules.forEach(schedule => {
			describe(schedule.type || schedule.memo, () => {
				beforeEach(() => {
					expected = schedule;
					scheduleEditView.enterScheduleDetails(expected);
				});

				commonBehaviour();

				it("should insert a new schedule when the save button is clicked", () => {
					scheduleEditView.save();

					// Row count should have incremented by one
					scheduleIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

					// Schedule in the target row should be the new schedule
					scheduleIndexView.checkRowValues(targetRow, expected);
				});
			});
		});
	});

	/*
	describe("editing a category", () => {
		describe("parent", () => {
			describe("expense", () => {
				beforeEach(() => scheduleIndexView.lastCategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "AA Test category (edited)", direction: "inflow"};
					scheduleEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					scheduleEditView.save();

					// Row count should not have changed
					scheduleIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the first category
					scheduleIndexView.firstCategory().then(row => scheduleIndexView.checkRowValues(row, expected));
				});
			});

			describe("income", () => {
				beforeEach(() => scheduleIndexView.firstCategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "ZZZ Test category (edited)", direction: "outflow"};
					scheduleEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					scheduleEditView.save();

					// Row count should not have changed
					scheduleIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the last category
					scheduleIndexView.lastCategory().then(row => scheduleIndexView.checkRowValues(row, expected));
				});
			});
		});

		describe("subcategory", () => {
			describe("income", () => {
				beforeEach(() => scheduleIndexView.firstSubcategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "ZZZ Test subcategory (edited)", categoryParent: "ZZZ Test category (edited", direction: "outflow", isSubcategory: true};
					scheduleEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					scheduleEditView.save();

					// Row count should not have changed
					scheduleIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the last subcategory
					scheduleIndexView.lastSubcategory().then(row => scheduleIndexView.checkRowValues(row, expected));
				});
			});

			describe("expense", () => {
				beforeEach(() => scheduleIndexView.lastSubcategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "AAA Test subcategory (edited)", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
					scheduleEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					scheduleEditView.save();

					// Row count should not have changed
					scheduleIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the first subcategory
					scheduleIndexView.firstSubcategory().then(row => scheduleIndexView.checkRowValues(row, expected));
				});
			});
		});
	});
	*/
});
