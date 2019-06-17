describe("categoryIndexView", () => {
	const categoryIndexView = require("./index");
	let expected;

	beforeEach(() => {
		expected = [];
		for (let i = 1; i <= 10; i += 3) {
			expected.push({ direction: "inflow", categoryName: `Category ${i}` });
			expected.push({ direction: "inflow", categoryName: `Category ${i + 1}`, parent: `Category ${i}`, isSubcategory: true });
			expected.push({ direction: "inflow", categoryName: `Category ${i + 2}`, parent: `Category ${i}`, isSubcategory: true });
		}

		for (let i = 13; i <= 19; i += 3) {
			expected.push({ direction: "outflow", categoryName: `Category ${i}` });
			expected.push({ direction: "outflow", categoryName: `Category ${i + 1}`, parent: `Category ${i}`, isSubcategory: true });
			expected.push({ direction: "outflow", categoryName: `Category ${i + 2}`, parent: `Category ${i}`, isSubcategory: true });
		}

		expected = expected.sort((a, b) => {
			let x, y;

			if (a.direction === b.direction) {
				x = a.parent ? `${a.parent}#${a.categoryName}` : a.categoryName;
				y = b.parent ? `${b.parent}#${b.categoryName}` : b.categoryName;
			} else {
				x = a.direction;
				y = b.direction;
			}

			return x.localeCompare(y);
		});

		// Go to the category index page
		browser.get("/#!/categories");
		browser.wait(protractor.ExpectedConditions.presenceOf(categoryIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
	});

	it("should display a row for each category", () => {
		// Number of rows
		categoryIndexView.table.rows.count().should.eventually.equal(expected.length);

		categoryIndexView.table.rows.each((row, index) => {
			// Row values
			categoryIndexView.checkRowValues(row, expected[index]);

			// Edit button
			categoryIndexView.editButton(row).isPresent().should.eventually.be.true;
		});
	});

	categoryIndexView.table.behavesLikeNavigableTable();
});
