function ogTableNavigableViewSpec(table) {
	describe("table navigation", () => {
		let	targetRow,
				totalRows;

		beforeEach(() => table.rows.count().then(count => (totalRows = count)));

		describe("forward", () => {
			beforeEach(() => table.clickRow(0));

			it("should focus the selected row", () => (targetRow = 0));

			describe("by one row", () => {
				beforeEach(() => (targetRow = 1));

				it("should move the focus down by one row when the 'J' key is pressed", () => table.j());

				it("should move the focus down by one row when the arrow down key is pressed", () => table.arrowDown());
			});

			describe("by ten rows", () => {
				beforeEach(() => (targetRow = totalRows > 10 ? 10 : totalRows - 1));

				it("should move the focus down by ten rows when the page down key is pressed", () => table.pageDown());
			});
		});

		describe("backward", () => {
			beforeEach(() => table.clickRow(totalRows - 1));

			describe("by one row", () => {
				beforeEach(() => (targetRow = totalRows - 2));

				it("should move the focus up by one row when the 'K' key is pressed", () => table.k());

				it("should move the focus up by one row when the arrow up key is pressed", () => table.arrowUp());
			});

			describe("by ten rows", () => {
				beforeEach(() => (targetRow = totalRows > 10 ? totalRows - 11 : 0));

				it("should move the focus up by ten rows when the page up key is pressed", () => table.pageUp());
			});
		});

		afterEach(() => {
			table.focussedRowCount().should.eventually.equal(1);
			table.isFocussed(table.row(targetRow)).should.eventually.be.true;
		});
	});

	describe("table actions", () => {
		let action;

		describe("insert", () => {
			beforeEach(() => (action = "insert"));

			it(`should display the ${table.actions.insert.heading} view when the insert key is pressed`, () => table.insert());

			it(`should display the ${table.actions.insert.heading} view when the CTRL+N keys are pressed`, () => table.ctrlN());
		});

		describe("edit", () => {
			beforeEach(() => (action = "edit"));

			if (table.actions.edit.mouseAction) {
				it(`should display the ${table.actions.edit.heading} view when the ${table.actions.edit.mouseAction.name}`, () => table.actions.edit.mouseAction.perform(table.row(0)));
			}

			it(`should display the ${table.actions.edit.heading} view when the CTRL+E keys are pressed`, () => {
				table.clickRow(0);
				table.ctrlE();
			});
		});

		describe("delete", () => {
			beforeEach(() => {
				action = "del";
				table.clickRow(3);
			});

			it(`should display the ${table.actions.del.heading} view when the delete key is pressed`, () => table.del());

			it(`should display the ${table.actions.del.heading} view when the backspace key is pressed`, () => table.backSpace());
		});

		describe("select", () => {
			beforeEach(() => {
				action = "select";
				table.clickRow(0);
			});

			it(`should display the ${table.actions.select.heading}${table.actions.select.heading2 || ""} view when the row is double clicked`, () => table.doubleClickRow(0));

			it(`should display the ${table.actions.select.heading}${table.actions.select.heading2 || ""} view when the enter key is pressed`, () => table.enter());
		});

		afterEach(() => {
			browser.wait(protractor.ExpectedConditions.presenceOf(table.actions[action].view), 3000, "Timeout waiting for view to render");
			table.actions[action].view.heading().should.eventually.equal(table.actions[action].heading);
		});
	});
}

module.exports = ogTableNavigableViewSpec;