(function() {
	"use strict";

	function SecurityIndexView() {
		var view = this,
				OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

		/**
		 * UI elements
		 */
		view.table = new OgTableNavigableView({
			rows: element.all(by.repeater("security in vm.securities")),
			actions: {
				insert: {
					heading: "Add Security",
					view: require("./edit")
				},
				edit: {
					heading: "Edit Security",
					view: require("./edit"),
					mouseAction: {
						name: "edit icon is clicked",
						perform: function(row) {
							view.editButton(row).click();
						}
					}
				},
				del: {
					heading: "Delete Security?",
					view: require("./delete")
				},
				select: {
					heading: "Security 1",
					heading2: " Transactions",
					view: require("../../transactions/views/index")
				}
			}
		});
		view.securityName = securityName;
		view.securityCode = securityCode;
		view.currentHolding = currentHolding;
		view.closingBalance = closingBalance;
		view.editButton = editButton;
		view.noHoldings = element.all(by.css("tr.text-muted"));
		view.unused = element.all(by.cssContainingText("em.text-info", "No transactions"));
		view.negativeAmounts = element.all(by.css(".amount.text-danger"));
		view.total = total;

		/**
		 * Behaviours
		 */
		view.goToSecurity = goToSecurity;
		view.addSecurity = addSecurity;
		view.editSecurity = editSecurity;
		view.deleteSecurity = deleteSecurity;

		function securityName(row) {
			return row.element(by.binding("::security.name")).getText();
		}

		function securityCode(row) {
			return row.element(by.binding("::security.code")).getText();
		}

		function currentHolding(row) {
			return row.element(by.binding("::security.current_holding")).getText();
		}

		function closingBalance(row) {
			return row.element(by.binding("::security.closing_balance")).getText();
		}

		function editButton(row) {
			return row.element(by.css("i.glyphicon-edit"));
		}

		function total() {
			return element(by.binding("::vm.totalValue")).getText();
		}

		// Double click a security
		function goToSecurity() {
			//TODO
		}

		// Create a new security
		function addSecurity() {
			view.table.ctrlN();
		}

		// Edit a security
		function editSecurity(index) {
			view.table.clickRow(index);
			view.table.ctrlE();
		}

		// Delete a security
		function deleteSecurity(index) {
			view.table.clickRow(index);
			view.table.del();
		}
	}

	module.exports = new SecurityIndexView();
})();
