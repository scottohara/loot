(function() {
	"use strict";

	function OgTableNavigableView(config) {
		var table = this;

		/**
		 * UI elements
		 */
		table.rows = config.rows;
		table.actions = config.actions;
		table.row = row;
		table.firstRow = firstRow;
		table.lastRow = lastRow;
		table.secondLastRow = secondLastRow;
		table.focussedRowCount = focussedRowCount;

		/**
		 * Behaviours
		 */
		table.clickRow = clickRow;
		table.doubleClickRow = doubleClickRow;
		table.isFocussed = isFocussed;
		table.j = sendJKey;
		table.k = sendKKey;
		table.arrowDown = sendArrowDownKey;
		table.arrowUp = sendArrowUpKey;
		table.pageDown = sendPageDownKey;
		table.pageUp = sendPageUpKey;
		table.insert = sendInsertKey;
		table.ctrlN = sendCtrlNKeys;
		table.ctrlE = sendCtrlEKeys;
		table.del = sendDeleteKey;
		table.backSpace = sendBackSpaceKey;
		table.enter = sendEnterKey;
		table.behavesLikeNavigableTable = behavesLikeNavigableTable;

		// Returns a table row by it's index
		function row(index) {
			return table.rows.get(index);
		}

		// Returns the first table row
		function firstRow() {
			return table.rows.first();
		}

		// Returns the last table row
		function lastRow() {
			return table.rows.last();
		}

		// Returns the second last table row
		function secondLastRow() {
			return table.rows.count().then(function(totalRows) {
				return table.row(totalRows - 2);
			});
		}

		// Returns the number of rows focussed
		function focussedRowCount() {
			return table.rows.filter(isFocussed).count();
		}

		// Click on a row
		function clickRow(index) {
			table.row(index).click();
		}

		// Double click on a row
		function doubleClickRow(index) {
			browser.actions().doubleClick(table.row(index)).perform();
		}

		// Checks if the specified row is focussed
		function isFocussed(row) {
			return row.getAttribute("class").then(function(attribute) {
				return attribute.indexOf("warning") !== -1;
			});
		}

		// Sends the 'J' key to the table
		function sendJKey() {
			sendKeys("j");
		}

		// Sends the 'K' key to the table
		function sendKKey() {
			sendKeys("k");
		}

		// Sends the arrow down key to the table
		function sendArrowDownKey() {
			sendKeys(protractor.Key.ARROW_DOWN);
		}

		// Sends the arrow up key to the table
		function sendArrowUpKey() {
			sendKeys(protractor.Key.ARROW_UP);
		}

		// Sends the page down key to the table
		function sendPageDownKey() {
			sendKeys(protractor.Key.PAGE_DOWN);
		}

		// Sends the page up key to the table
		function sendPageUpKey() {
			sendKeys(protractor.Key.PAGE_UP);
		}

		// Sends the insert key to the table
		function sendInsertKey() {
			sendKeys(protractor.Key.INSERT);
		}

		// Sends the CTRL+N keys to the table
		function sendCtrlNKeys() {
			sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "n"));
		}

		// Sends the CTRL+E keys to the table
		function sendCtrlEKeys() {
			sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "e"));
		}

		// Sends the delete key to the table
		function sendDeleteKey() {
			sendKeys(protractor.Key.DELETE);
		}

		// Sends the backspace key to the table
		function sendBackSpaceKey() {
			sendKeys(protractor.Key.BACK_SPACE);
		}

		// Sends the enter key to the table
		function sendEnterKey() {
			sendKeys(protractor.Key.ENTER);
		}

		// Sends the specified key(s) to the table
		function sendKeys(keys) {
			$("body").sendKeys(keys);
		}

		// Runs the table navigable specs for the table
		function behavesLikeNavigableTable() {
			require("./og-table-navigable_spec")(table);
		}
	}

	module.exports = OgTableNavigableView;
})();
