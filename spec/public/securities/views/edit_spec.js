(function() {
	"use strict";

	/*jshint expr: true */

	describe("securityEditView", function() {
		var securityIndexView,
				securityEditView,
				expected,
				originalRowCount,
				lastSecurityName,
				lastSecurityCode;

		beforeEach(function() {
			securityIndexView = require("./index");
			securityEditView = require("./edit");

			// Go to the securities index page
			browser.get("/index.html#/securities");
			browser.wait(protractor.ExpectedConditions.presenceOf(securityIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

			securityIndexView.table.rows.count().then(function(count) {
				originalRowCount = count;
			});

			securityIndexView.securityName(securityIndexView.table.lastRow()).then(function(securityName) {
				lastSecurityName = securityName;
			});

			securityIndexView.securityCode(securityIndexView.table.lastRow()).then(function(securityCode) {
				lastSecurityCode = securityCode;
			});
		});

		describe("adding a security", function() {
			beforeEach(function() {
				expected = {name: "Test security", code: "TEST"};

				// Add a new security
				securityIndexView.addSecurity();
				waitForSecurityEditView("Add");
				securityEditView.enterSecurityDetails({securityName: expected.name, securityCode: expected.code});
			});

			commonBehaviour();

			it("should insert a new security when the save button is clicked", function() {
				securityEditView.save();

				// Row count should have incremented by one
				securityIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

				// Security in the last row should be the new security
				securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(expected.name + "\nNo transactions");
				securityIndexView.securityCode(securityIndexView.table.lastRow()).should.eventually.equal(expected.code);
			});
		});

		describe("editing a security", function() {
			beforeEach(function() {
				expected = {name: "Test security (edited)", code: "TEST2"};

				// Edit an existing security
				securityIndexView.editSecurity(originalRowCount - 1);
				waitForSecurityEditView("Edit");
				securityEditView.securityNameInput.getAttribute("value").should.eventually.equal(lastSecurityName.replace("\nNo transactions", ""));
				securityEditView.securityCodeInput.getAttribute("value").should.eventually.equal(lastSecurityCode);
				securityEditView.enterSecurityDetails({securityName: expected.name, securityCode: expected.code});
			});

			commonBehaviour();

			it("should update an existing security when the save button is clicked", function() {
				securityEditView.save();

				// Row count should not have changed
				securityIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Security in the last row should be the new security
				securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(expected.name + "\nNo transactions");
				securityIndexView.securityCode(securityIndexView.table.lastRow()).should.eventually.equal(expected.code);
			});
		});

		function waitForSecurityEditView(mode) {
			browser.wait(securityEditView.isPresent, 3000, "Timeout waiting for view to render");
			securityEditView.heading().should.eventually.equal(mode + " Security");
		}

		function commonBehaviour() {
			it("should not save changes when the cancel button is clicked", function() {
				securityEditView.cancel();

				// Row count should not have changed
				securityIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Security in the last row should not have changed
				securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(lastSecurityName);
				securityIndexView.securityCode(securityIndexView.table.lastRow()).should.eventually.equal(lastSecurityCode);
			});

			describe("invalid data", function() {
				beforeEach(function() {
					securityEditView.clearSecurityDetails();
				});

				it("should not enable the save button", function() {
					securityEditView.saveButton.isEnabled().should.eventually.be.false;
				});

				//TODO - security name should show red cross when invalid
				//TODO - form group around security name should have 'has-error' class when invalid
			});

			//TODO - error message should display when present
			//TODO - security name text should be selected when input gets focus
		}
	});
})();
