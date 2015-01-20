(function() {
	"use strict";

	/*jshint expr: true */

	describe("payeeEditView", function() {
		var payeeIndexView,
				payeeEditView,
				expected,
				originalRowCount,
				lastPayeeName;

		beforeEach(function() {
			payeeIndexView = require("./index");
			payeeEditView = require("./edit");

			// Go to the payees index page
			browser.get("/index.html#/payees");
			browser.wait(protractor.ExpectedConditions.presenceOf(payeeIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

			payeeIndexView.table.rows.count().then(function(count) {
				originalRowCount = count;
			});

			payeeIndexView.payeeName(payeeIndexView.table.lastRow()).then(function(payeeName) {
				lastPayeeName = payeeName;
			});
		});

		describe("adding a payee", function() {
			beforeEach(function() {
				expected = "Test payee";

				// Add a new payee
				payeeIndexView.addPayee();
				waitForPayeeEditView("Add");
				payeeEditView.enterPayeeDetails({payeeName: expected});
			});

			commonBehaviour();

			it("should insert a new payee when the save button is clicked", function() {
				payeeEditView.save();

				// Row count should have incremented by one
				payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

				// Payee in the last row should be the new payee
				payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(expected);
			});
		});

		describe("editing a payee", function() {
			beforeEach(function() {
				expected = "Test payee (edited)";

				// Edit an existing payee
				payeeIndexView.editPayee(originalRowCount - 1);
				waitForPayeeEditView("Edit");
				payeeEditView.payeeNameInput.getAttribute("value").should.eventually.equal(lastPayeeName);
				payeeEditView.enterPayeeDetails({payeeName: expected});
			});

			commonBehaviour();

			it("should update an existing payee when the save button is clicked", function() {
				payeeEditView.save();

				// Row count should not have changed
				payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Payee in the last row should be the new payee
				payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(expected);
			});
		});

		function waitForPayeeEditView(mode) {
			browser.wait(payeeEditView.isPresent, 3000, "Timeout waiting for view to render");
			payeeEditView.heading().should.eventually.equal(mode + " Payee");
		}

		function commonBehaviour() {
			it("should not save changes when the cancel button is clicked", function() {
				payeeEditView.cancel();

				// Row count should not have changed
				payeeIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Payee in the last row should not have changed
				payeeIndexView.payeeName(payeeIndexView.table.lastRow()).should.eventually.equal(lastPayeeName);
			});

			describe("invalid data", function() {
				beforeEach(function() {
					payeeEditView.clearPayeeDetails();
				});

				it("should not enable the save button", function() {
					payeeEditView.saveButton.isEnabled().should.eventually.be.false;
				});

				//TODO - payee name should show red cross when invalid
				//TODO - form group around payee name should have 'has-error' class when invalid
			});

			//TODO - error message should display when present
			//TODO - payee name text should be selected when input gets focus
		}
	});
})();
