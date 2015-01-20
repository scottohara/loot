(function() {
	"use strict";

	/*jshint expr: true */

	describe("securityDeleteView", function() {
		var securityIndexView,
				securityDeleteView,
				originalRowCount,
				lastSecurityName,
				lastSecurityCode,
				secondLastSecurityName;

		beforeEach(function() {
			securityIndexView = require("./index");
			securityDeleteView = require("./delete");

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

			securityIndexView.table.secondLastRow().then(securityIndexView.securityName).then(function(securityName) {
				secondLastSecurityName = securityName;
			});
		});

		describe("deleting a security", function() {
			beforeEach(function() {
				// Delete an existing security
				securityIndexView.deleteSecurity(originalRowCount - 1);
				browser.wait(securityDeleteView.isPresent, 3000, "Timeout waiting for view to render");
			});

			it("should display the details of the security being deleted", function() {
				securityDeleteView.securityName().should.eventually.equal(lastSecurityName.replace("\nNo transactions", ""));
				securityDeleteView.securityCode().should.eventually.equal(lastSecurityCode);
			});

			it("should not save changes when the cancel button is clicked", function() {
				securityDeleteView.cancel();

				// Row count should not have changed
				securityIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Security in the last row should not have changed
				securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(lastSecurityName);
			});

			it("should delete an existing security when the delete button is clicked", function() {
				securityDeleteView.del();

				// Row count should have decremented by one
				securityIndexView.table.rows.count().should.eventually.equal(originalRowCount - 1);

				// Security previously in the 2nd last row should now be in the last row
				securityIndexView.securityName(securityIndexView.table.lastRow()).should.eventually.equal(secondLastSecurityName);
			});

			//TODO - error message should display when present
		});
	});
})();
