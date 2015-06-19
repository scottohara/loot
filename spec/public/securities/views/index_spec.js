describe("securityIndexView", () => {
	const securityIndexView = require("./index");
	let	expected,
			expectedTotal;

	beforeEach(() => {
		expected = [];
		expected.push({name: "Security 1", code: "A", holding: "1.000", balance: "$1.00", unused: false});
		expected.push({name: "Security 2", code: "B", holding: "-2.000", balance: "($2.00)", unused: false});
		for (let i = 3; i <= 20; i++) {
			expected.push({name: `Security ${i}`, code: String.fromCharCode(64 + i), holding: "0.000", balance: "$0.00", unused: true});
		}
		expected = expected.sort((a, b) => {
			let x, y;

			if (a.unused === b.unused) {
				if (a.holding > 0 === b.holding > 0) {
					x = a.name;
					y = b.name;
				} else {
					x = a.holding <= 0;
					y = b.holding <= 0;
				}
			} else {
				x = a.unused;
				y = b.unused;
			}

			return x < y ? -1 : x > y ? 1 : 0;
		});
		expectedTotal = "Total: ($1.00)";

		// Go to the securities index page
		browser.get("/index.html#/securities");
		browser.wait(protractor.ExpectedConditions.presenceOf(securityIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
	});

	it("should display a row for each security", () => {
		// Number of rows
		securityIndexView.table.rows.count().should.eventually.equal(expected.length);

		securityIndexView.table.rows.each((row, index) => {
			// Security name
			securityIndexView.securityName(row).should.eventually.equal(`${expected[index].name}${expected[index].unused ? "\nNo transactions" : ""}`);

			// Edit button
			securityIndexView.editButton(row).isPresent().should.eventually.be.true;

			// Security code
			securityIndexView.securityCode(row).should.eventually.equal(expected[index].code);

			// Current holding
			securityIndexView.currentHolding(row).should.eventually.equal(expected[index].holding);

			// Closing balance
			securityIndexView.closingBalance(row).should.eventually.equal(expected[index].balance);
		});
	});

	it("should indicate any securities with no current holdings", () => securityIndexView.noHoldings.count().should.eventually.equal(19));

	it("should indicate any unused securities", () => securityIndexView.unused.count().should.eventually.equal(18));

	it("should indicate any negative amounts", () => securityIndexView.negativeAmounts.count().should.eventually.equal(3));

	it("should display a total for all securities", () => securityIndexView.total().should.eventually.equal(expectedTotal));

	securityIndexView.table.behavesLikeNavigableTable();
});
