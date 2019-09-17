class OgTableNavigableView {
	constructor(config) {
		this.rows = config.rows;
		this.actions = config.actions;
		this.j = this.sendJKey.bind(this);
		this.k = this.sendKKey.bind(this);
		this.arrowDown = this.sendArrowDownKey.bind(this);
		this.arrowUp = this.sendArrowUpKey.bind(this);
		this.pageDown = this.sendPageDownKey.bind(this);
		this.pageUp = this.sendPageUpKey.bind(this);
		this.insert = this.sendInsertKey.bind(this);
		this.ctrlN = this.sendCtrlNKeys.bind(this);
		this.ctrlE = this.sendCtrlEKeys.bind(this);
		this.del = this.sendDeleteKey.bind(this);
		this.backSpace = this.sendBackSpaceKey.bind(this);
		this.enter = this.sendEnterKey.bind(this);
	}

	// Returns a table row by it's index
	row(index, scrollIntoView) {
		const row = this.rows.get(index);

		if ("function" === typeof scrollIntoView) {
			browser.executeScript(scrollToRow => scrollToRow.scrollIntoView(), row);
		}

		return row;
	}

	// Returns the first table row
	firstRow() {
		return this.rows.first();
	}

	// Returns the last table row
	lastRow() {
		return this.rows.last();
	}

	// Returns the second last table row
	secondLastRow() {
		return this.rows.count().then(totalRows => this.row(totalRows - 2));
	}

	// Returns the number of rows focussed
	focussedRowCount() {
		return this.rows.filter(this.isFocussed.bind(this)).count();
	}

	// Click on a row
	clickRow(index) {
		this.row(index, true).click();
	}

	// Double click on a row
	doubleClickRow(index) {
		browser.actions().doubleClick(this.row(index)).perform();
	}

	// Checks if the specified row is focussed
	isFocussed(row) {
		return row.getAttribute("class").then(attribute => attribute.indexOf("warning") !== -1);
	}

	// Sends the 'J' key to the table
	sendJKey() {
		this.sendKeys("j");
	}

	// Sends the 'K' key to the table
	sendKKey() {
		this.sendKeys("k");
	}

	// Sends the arrow down key to the table
	sendArrowDownKey() {
		this.sendKeys(protractor.Key.ARROW_DOWN);
	}

	// Sends the arrow up key to the table
	sendArrowUpKey() {
		this.sendKeys(protractor.Key.ARROW_UP);
	}

	// Sends the page down key to the table
	sendPageDownKey() {
		this.sendKeys(protractor.Key.PAGE_DOWN);
	}

	// Sends the page up key to the table
	sendPageUpKey() {
		this.sendKeys(protractor.Key.PAGE_UP);
	}

	// Sends the insert key to the table
	sendInsertKey() {
		this.sendKeys(protractor.Key.INSERT);
	}

	// Sends the CTRL+N keys to the table
	sendCtrlNKeys() {
		this.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "n"));
	}

	// Sends the CTRL+E keys to the table
	sendCtrlEKeys() {
		this.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "e"));
	}

	// Sends the delete key to the table
	sendDeleteKey() {
		this.sendKeys(protractor.Key.DELETE);
	}

	// Sends the backspace key to the table
	sendBackSpaceKey() {
		this.sendKeys(protractor.Key.BACK_SPACE);
	}

	// Sends the enter key to the table
	sendEnterKey() {
		this.sendKeys(protractor.Key.ENTER);
	}

	// Sends the specified key(s) to the table
	sendKeys(keys) {
		$("body").sendKeys(keys);
	}

	// Runs the table navigable specs for the table
	behavesLikeNavigableTable() {
		require("./og-table-navigable_spec")(this);
	}
}

module.exports = OgTableNavigableView;