import {
	DIRECTION_INFLOW,
	DIRECTION_OUTFLOW,
	categoriesTableRows,
	checkRowMatches,
	firstParentCategory,
	firstSubcategory,
	getValuesFrom,
	lastParentCategory,
	lastSubcategory
} from "categories/index";
import {
	cancelButton,
	categoryEditForm,
	categoryEditHeading,
	checkFormMatches,
	invalidateForm,
	populateFormWith,
	saveButton
} from "categories/edit";
import type { Category } from "categories/types";

describe("Category Edit", (): void => {
	let	expected: Category,
			originalRowCount: number;

	function commonBehaviour(targetRow: string): void {
		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(categoryEditForm).should("not.exist");

			// Row count should not have changed
			cy.get(categoriesTableRows).should("have.length", originalRowCount);

			// Category in the target row should not have changed
			cy.get(targetRow).within((row: JQuery<HTMLTableRowElement>): void => checkRowMatches(getValuesFrom(row)));
		});

		describe("invalid data", (): void => {
			beforeEach((): void => invalidateForm());

			it("should not enable the save button", (): Cypress.Chainable<JQuery> => cy.get(saveButton).should("not.be.enabled"));

			// MISSING - category name, parent & direction should show red cross when invalid

			// MISSING - form group around category name & parent should have 'has-error' class when invalid

			// MISSING - parent should behave like non-editable typeahead
		});

		// MISSING - error message should display when present

		// MISSING - category name & parent text should be selected when input gets focus
	}

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/categories");
		cy.get(categoriesTableRows).then((rows: JQuery<HTMLTableRowElement>): number => (originalRowCount = rows.length));
	});

	describe("adding a category", (): void => {
		before((): void => cy.createCategories());

		beforeEach((): void => {
			cy.get("body").type("{insert}");
			cy.get(categoryEditHeading).should("have.text", "Add Category");
		});

		describe("parent", (): void => {
			describe("expense", (): void => {
				beforeEach((): void => {
					expected = { direction: DIRECTION_OUTFLOW, name: "ZZZ Test category" };
					populateFormWith(expected);
				});

				commonBehaviour(lastParentCategory);

				it("should insert a new category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should have incremented by one
					cy.get(categoriesTableRows).should("have.length", originalRowCount + 1);

					// Category in the last row should be the new category
					cy.get(lastParentCategory).within((): void => checkRowMatches(expected));
				});
			});

			describe("income", (): void => {
				beforeEach((): void => {
					expected = { direction: DIRECTION_INFLOW, name: "AAA Test category" };
					populateFormWith(expected);
				});

				commonBehaviour(firstParentCategory);

				it("should insert a new category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should have incremented by one
					cy.get(categoriesTableRows).should("have.length", originalRowCount + 1);

					// Category in the first row should be the new category
					cy.get(firstParentCategory).within((): void => checkRowMatches(expected));
				});
			});
		});

		describe("subcategory", (): void => {
			describe("expense", (): void => {
				beforeEach((): void => {
					cy.get(lastParentCategory).then((row: JQuery<HTMLTableRowElement>): void => {
						expected = { direction: DIRECTION_OUTFLOW, name: "ZZZ Test subcategory", parent: getValuesFrom(row).name };
						populateFormWith(expected);
					});
				});

				commonBehaviour(lastParentCategory);

				it("should insert a new category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should have incremented by one
					cy.get(categoriesTableRows).should("have.length", originalRowCount + 1);

					// Category in the last row should be the new category
					cy.get(lastSubcategory).within((): void => checkRowMatches(expected));
				});
			});

			describe("income", (): void => {
				beforeEach((): void => {
					cy.get(firstParentCategory).then((row: JQuery<HTMLTableRowElement>): void => {
						expected = { direction: DIRECTION_INFLOW, name: "AAA Test subcategory", parent: getValuesFrom(row).name };
						populateFormWith(expected);
					});
				});

				commonBehaviour(firstParentCategory);

				it("should insert a new category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should have incremented by one
					cy.get(categoriesTableRows).should("have.length", originalRowCount + 1);

					// Category in the second row should be the new category
					cy.get(firstSubcategory).within((): void => checkRowMatches(expected));
				});
			});
		});
	});

	function editRow(rowToEdit: string): void {
		cy.get(rowToEdit).click();
		cy.get("body").type("{ctrl}e");
		cy.get(categoryEditHeading).should("have.text", "Edit Category");
		cy.get(rowToEdit).then((row: JQuery<HTMLTableRowElement>): void => checkFormMatches(getValuesFrom(row)));
	}

	describe("editing a category", (): void => {
		before((): void => cy.createCategories());

		describe("parent", (): void => {
			describe("expense", (): void => {
				beforeEach((): void => {
					expected = { direction: DIRECTION_INFLOW, name: "AA Test category (edited)", favourite: true };
					editRow(lastParentCategory);
					populateFormWith(expected);
				});

				commonBehaviour(lastParentCategory);

				it("should update an existing category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should not have changed
					cy.get(categoriesTableRows).should("have.length", originalRowCount);

					// After editing, the row should now be the first category
					cy.get(firstParentCategory).within((): void => checkRowMatches(expected));
				});
			});

			describe("income", (): void => {
				beforeEach((): void => {
					expected = { direction: DIRECTION_OUTFLOW, name: "ZZZ Test category (edited)", favourite: true };
					editRow(firstParentCategory);
					populateFormWith(expected);
				});

				commonBehaviour(firstParentCategory);

				it("should update an existing category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should not have changed
					cy.get(categoriesTableRows).should("have.length", originalRowCount);

					// After editing, the row should now be the last category
					cy.get(lastParentCategory).within((): void => checkRowMatches(expected));
				});
			});
		});

		describe("subcategory", (): void => {
			describe("income", (): void => {
				beforeEach((): void => {
					cy.get(lastParentCategory).then((row: JQuery<HTMLTableRowElement>): void => {
						expected = { direction: DIRECTION_OUTFLOW, name: "ZZZ Test subcategory (edited)", parent: getValuesFrom(row).name };
						editRow(firstSubcategory);
						populateFormWith(expected);
					});
				});

				commonBehaviour(firstSubcategory);

				it("should update an existing category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should not have changed
					cy.get(categoriesTableRows).should("have.length", originalRowCount);

					// After editing, the row should now be the last row
					cy.get(lastSubcategory).within((): void => checkRowMatches(expected));
				});
			});

			describe("expense", (): void => {
				beforeEach((): void => {
					cy.get(firstParentCategory).then((row: JQuery<HTMLTableRowElement>): void => {
						expected = { direction: DIRECTION_INFLOW, name: "AAA Test subcategory (edited)", parent: getValuesFrom(row).name };
						editRow(lastSubcategory);
						populateFormWith(expected);
					});
				});

				commonBehaviour(lastSubcategory);

				it("should update an existing category when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(categoryEditForm).should("not.exist");

					// Row count should not have changed
					cy.get(categoriesTableRows).should("have.length", originalRowCount);

					// After editing, the row should now be the second row
					cy.get(firstSubcategory).within((): void => checkRowMatches(expected));
				});
			});
		});
	});
});