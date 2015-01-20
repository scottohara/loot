(function() {
	"use strict";

	/*jshint expr: true */

	describe("payeeIndexView", function() {
		var payeeIndexView = require("./index"),
				expected;

		beforeEach(function() {
			expected = [];
			for (var i = 1; i <= 20; i++) {
				expected.push("Payee " + i);
			}
			expected = expected.sort();

			// Go to the payees index page
			browser.get("/index.html#/payees");
			browser.wait(protractor.ExpectedConditions.presenceOf(payeeIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
		});

		it("should display a row for each payee", function() {
			// Number of rows
			payeeIndexView.table.rows.count().should.eventually.equal(expected.length);

			payeeIndexView.table.rows.each(function(row, index) {
				// Payee name
				payeeIndexView.payeeName(row).should.eventually.equal(expected[index]);

				// Edit button
				payeeIndexView.editButton(row).isPresent().should.eventually.be.true;
			});
		});

		payeeIndexView.table.behavesLikeNavigableTable();
	});
})();
