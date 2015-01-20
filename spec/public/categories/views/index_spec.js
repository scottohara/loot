(function() {
	"use strict";

	/*jshint expr: true */

	describe("categoryIndexView", function() {
		var categoryIndexView = require("./index"),
				expected;

		beforeEach(function() {
			expected = [];
			for (var i = 1; i <= 10; i+=3) {
				expected.push({direction: "inflow", categoryName: "Category " + i});
				expected.push({direction: "inflow", categoryName: "Category " + (i+1), parent: "Category " + i, isSubcategory: true});
				expected.push({direction: "inflow", categoryName: "Category " + (i+2), parent: "Category " + i, isSubcategory: true});
			}
			for (i = 13; i <= 19; i+=3) {
				expected.push({direction: "outflow", categoryName: "Category " + i});
				expected.push({direction: "outflow", categoryName: "Category " + (i+1), parent: "Category " + i, isSubcategory: true});
				expected.push({direction: "outflow", categoryName: "Category " + (i+2), parent: "Category " + i, isSubcategory: true});
			}
			expected = expected.sort(function(a, b) {
				var x, y;

				if (a.direction === b.direction) {
					x = a.parent ? a.parent + "#" + a.categoryName : a.categoryName;
					y = b.parent ? b.parent + "#" + b.categoryName : b.categoryName;
				} else {
					x = a.direction;
					y = b.direction;
				}

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			});

			// Go to the category index page
			browser.get("/index.html#/categories");
			browser.wait(protractor.ExpectedConditions.presenceOf(categoryIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
		});

		it("should display a row for each category", function() {
			// Number of rows
			categoryIndexView.table.rows.count().should.eventually.equal(expected.length);

			categoryIndexView.table.rows.each(function(row, index) {
				// Row values
				categoryIndexView.checkRowValues(row, expected[index]);

				// Edit button
				categoryIndexView.editButton(row).isPresent().should.eventually.be.true;
			});
		});

		categoryIndexView.table.behavesLikeNavigableTable();
	});
})();
