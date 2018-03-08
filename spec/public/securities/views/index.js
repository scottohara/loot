class SecurityIndexView {
	constructor() {
		const OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");
		const self = this;

		this.table = new OgTableNavigableView({
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
						perform: row => self.editButton(row).click()
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
		this.noHoldings = element.all(by.css("tr.text-muted"));
		this.unused = element.all(by.cssContainingText("em.text-info", "No transactions"));
		this.negativeAmounts = element.all(by.css(".amount.text-danger"));
	}

	securityName(row) {
		return row.element(by.binding("::security.name")).getText();
	}

	securityCode(row) {
		return row.element(by.binding("::security.code")).getText();
	}

	currentHolding(row) {
		return row.element(by.binding("::security.current_holding")).getText();
	}

	closingBalance(row) {
		return row.element(by.binding("::security.closing_balance")).getText();
	}

	editButton(row) {
		return row.element(by.css("i.glyphicon-edit"));
	}

	total() {
		return element(by.binding("::vm.totalValue")).getText();
	}

	// Double click a security
	goToSecurity() {
		// MISSING
	}

	// Create a new security
	addSecurity() {
		this.table.ctrlN();
	}

	// Edit a security
	editSecurity(index) {
		this.table.clickRow(index);
		this.table.ctrlE();
	}

	// Delete a security
	deleteSecurity(index) {
		this.table.clickRow(index);
		this.table.del();
	}
}

module.exports = new SecurityIndexView();