(function() {
	"use strict";

	function PayeeIndexView() {
		var view = this,
				OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

		/**
		 * UI elements
		 */
		view.table = new OgTableNavigableView({
			rows: element.all(by.repeater("payee in vm.payees")),
			actions: {
				insert: {
					heading: "Add Payee",
					view: require("./edit")
				},
				edit: {
					heading: "Edit Payee",
					view: require("./edit"),
					mouseAction: {
						name: "edit icon is clicked",
						perform: function(row) {
							view.editButton(row).click();
						}
					}
				},
				del: {
					heading: "Delete Payee?",
					view: require("./delete")
				},
				select: {
					heading: "Payee 1",
					heading2: " Transactions",
					view: require("../../transactions/views/index")
				}
			}
		});
		view.payeeName = payeeName;
		view.editButton = editButton;

		/**
		 * Behaviours
		 */
		view.goToPayee = goToPayee;
		view.addPayee = addPayee;
		view.editPayee = editPayee;
		view.deletePayee = deletePayee;

		function payeeName(row) {
			return row.element(by.binding("::payee.name")).getText();
		}

		function editButton(row) {
			return row.element(by.css("i.glyphicon-edit"));
		}

		// Double click a payee
		function goToPayee() {
			//TODO
		}

		// Create a new payee
		function addPayee() {
			view.table.ctrlN();
		}

		// Edit a payee
		function editPayee(index) {
			view.table.clickRow(index);
			view.table.ctrlE();
		}

		// Delete a payee
		function deletePayee(index) {
			view.table.clickRow(index);
			view.table.del();
		}
	}

	module.exports = new PayeeIndexView();
})();
