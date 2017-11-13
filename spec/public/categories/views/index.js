class CategoryIndexView {
	constructor() {
		const OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js"),
					self = this;

		this.table = new OgTableNavigableView({
			rows: element.all(by.repeater("category in vm.categories")),
			actions: {
				insert: {
					heading: "Add Category",
					view: require("./edit")
				},
				edit: {
					heading: "Edit Category",
					view: require("./edit"),
					mouseAction: {
						name: "edit icon is clicked",
						perform(row) {
							self.editButton(row).click();
						}
					}
				},
				del: {
					heading: "Delete Category?",
					view: require("./delete")
				},
				select: {
					heading: "Category 1",
					heading2: " Transactions",
					view: require("../../transactions/views/index")
				}
			}
		});
	}

	directionIcon(row, direction) {
		return row.element(by.css(`i.glyphicon-${"inflow" === direction ? "plus" : "minus"}-sign`));
	}

	categoryName(row) {
		return row.element(by.binding("::category.name")).getText();
	}

	editButton(row) {
		return row.element(by.css("i.glyphicon-edit"));
	}

	categories(subcategories) {
		return this.table.rows.filter(row => this.isSubcategory(row).then(isSubcategory => isSubcategory === Boolean(subcategories)));
	}

	firstCategory() {
		return this.categories().then(categories => categories[0]);
	}

	secondCategory() {
		return this.categories().then(categories => categories[1]);
	}

	lastCategory() {
		return this.categories().then(categories => categories[categories.length - 1]);
	}

	secondLastCategory() {
		return this.categories().then(categories => categories[categories.length - 2]);
	}

	firstSubcategory() {
		return this.categories(true).then(subcategories => subcategories[0]);
	}

	secondSubcategory() {
		return this.categories(true).then(subcategories => subcategories[1]);
	}

	lastSubcategory() {
		return this.categories(true).then(subcategories => subcategories[subcategories.length - 1]);
	}

	secondLastSubcategory() {
		return this.categories(true).then(subcategories => subcategories[subcategories.length - 2]);
	}

	isSubcategory(row) {
		return row.element(by.css("td.subcategory")).isPresent();
	}

	categoryParent(row) {
		return row.evaluate("category.parent.name");
	}

	numChildren(row) {
		return row.evaluate("category.num_children");
	}

	// Double click a category
	goToCategory() {
		// MISSING
	}

	// Create a new category
	addCategory() {
		this.table.ctrlN();
	}

	// Edit a category
	editCategory(index) {
		this.table.clickRow(index);
		this.table.ctrlE();
	}

	// Delete a category
	deleteCategory(index) {
		this.table.clickRow(index);
		this.table.del();
	}

	// Gets the values from a row
	getRowValues(row) {
		return protractor.promise.all([
			this.categoryName(row),
			this.directionIcon(row, "inflow").isPresent(),
			this.directionIcon(row, "outflow").isPresent(),
			this.isSubcategory(row),
			this.categoryParent(row),
			this.numChildren(row)
		]).then(values => ({
			categoryName: values[0],
			direction: values[1] ? "inflow" : values[2] ? "outflow" : null,
			isSubcategory: values[3],
			categoryParent: values[4],
			numChildren: values[5]
		}));
	}

	// Checks the values in a row against an expected set of values
	checkRowValues(row, expected) {
		this.categoryName(row).should.eventually.equal(expected.categoryName);
		this.directionIcon(row, expected.direction).isPresent().should.eventually.be.true;
		this.isSubcategory(row).should.eventually.be.equal(Boolean(expected.isSubcategory));
	}
}

module.exports = new CategoryIndexView();