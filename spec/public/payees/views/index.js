class PayeeIndexView {
	constructor() {
		const OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");
		const self = this;

		this.table = new OgTableNavigableView({
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
						perform: row => self.editButton(row).click()
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
	}

	payeeName(row) {
		return row.element(by.binding("::payee.name")).getText();
	}

	editButton(row) {
		return row.element(by.css("i.glyphicon-edit"));
	}

	// Double click a payee
	goToPayee() {
		// MISSING
	}

	// Create a new payee
	addPayee() {
		this.table.ctrlN();
	}

	// Edit a payee
	editPayee(index) {
		this.table.clickRow(index);
		this.table.ctrlE();
	}

	// Delete a payee
	deletePayee(index) {
		this.table.clickRow(index);
		this.table.del();
	}
}

module.exports = new PayeeIndexView();