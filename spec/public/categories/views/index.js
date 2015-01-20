(function() {
	"use strict";

	function CategoryIndexView() {
		var view = this,
				OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

		/**
		 * UI elements
		 */
		view.table = new OgTableNavigableView({
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
						perform: function(row) {
							view.editButton(row).click();
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
		view.directionIcon = directionIcon;
		view.categoryName = categoryName;
		view.editButton = editButton;
		view.firstCategory = firstCategory;
		view.secondCategory = secondCategory;
		view.lastCategory = lastCategory;
		view.secondLastCategory = secondLastCategory;
		view.firstSubcategory = firstSubcategory;
		view.secondSubcategory = secondSubcategory;
		view.lastSubcategory = lastSubcategory;
		view.secondLastSubcategory = secondLastSubcategory;

		/**
		 * Behaviours
		 */
		view.isSubcategory = isSubcategory;
		view.categoryParent = categoryParent;
		view.numChildren = numChildren;
		view.goToCategory = goToCategory;
		view.addCategory = addCategory;
		view.editCategory = editCategory;
		view.deleteCategory = deleteCategory;
		view.getRowValues = getRowValues;
		view.checkRowValues = checkRowValues;

		function directionIcon(row, direction) {
			return row.element(by.css("i.glyphicon-" + ("inflow" === direction ? "plus" : "minus") + "-sign"));
		}

		function categoryName(row) {
			return row.element(by.binding("::category.name")).getText();
		}

		function editButton(row) {
			return row.element(by.css("i.glyphicon-edit"));
		}

		function categories(subcategories) {
			return view.table.rows.filter(function(row) {
				return view.isSubcategory(row).then(function(isSubcategory) {
					return isSubcategory === !!subcategories;
				});
			});
		}

		function firstCategory() {
			return categories().then(function(categories) {
				return categories[0];
			});
		}

		function secondCategory() {
			return categories().then(function(categories) {
				return categories[1];
			});
		}

		function lastCategory() {
			return categories().then(function(categories) {
				return categories[categories.length - 1];
			});
		}

		function secondLastCategory() {
			return categories().then(function(categories) {
				return categories[categories.length - 2];
			});
		}

		function firstSubcategory() {
			return categories(true).then(function(subcategories) {
				return subcategories[0];
			});
		}

		function secondSubcategory() {
			return categories(true).then(function(subcategories) {
				return subcategories[1];
			});
		}

		function lastSubcategory() {
			return categories(true).then(function(subcategories) {
				return subcategories[subcategories.length - 1];
			});
		}

		function secondLastSubcategory() {
			return categories(true).then(function(subcategories) {
				return subcategories[subcategories.length - 2];
			});
		}

		function isSubcategory(row) {
			return row.element(by.css("td.subcategory")).isPresent();
		}

		function categoryParent(row) {
			return row.evaluate("category.parent.name");
		}

		function numChildren(row) {
			return row.evaluate("category.num_children");
		}

		// Double click a category
		function goToCategory() {
			//TODO
		}

		// Create a new category
		function addCategory() {
			view.table.ctrlN();
		}

		// Edit a category
		function editCategory(index) {
			view.table.clickRow(index);
			view.table.ctrlE();
		}

		// Delete a category
		function deleteCategory(index) {
			view.table.clickRow(index);
			view.table.del();
		}

		// Gets the values from a row
		function getRowValues(row) {
			return protractor.promise.all([
				view.categoryName(row),
				view.directionIcon(row, "inflow").isPresent(),
				view.directionIcon(row, "outflow").isPresent(),
				view.isSubcategory(row),
				view.categoryParent(row),
				view.numChildren(row)
			]).then(function(values) {
				return {
					categoryName: values[0],
					direction: values[1] ? "inflow" : values[2] ? "outflow" : null,
					isSubcategory: values[3],
					categoryParent: values[4],
					numChildren: values[5]
				};
			});
		}

		// Checks the values in a row against an expected set of values
		function checkRowValues(row, expected) {
			view.categoryName(row).should.eventually.equal(expected.categoryName);
			view.directionIcon(row, expected.direction).isPresent().should.eventually.be.true;
			view.isSubcategory(row).should.eventually.be.equal(!!expected.isSubcategory);
		}
	}

	module.exports = new CategoryIndexView();
})();
