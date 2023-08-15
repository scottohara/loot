import {
	cancelButton,
	categoryDeleteForm,
	categoryDeleteHeading,
	categoryToDeleteDirection,
	categoryToDeleteName,
	categoryToDeleteParent,
	deleteButton,
	getDirectionLabel,
	warningMessage
} from "~/support/categories/delete";
import {
	categoriesTableRows,
	checkRowMatches,
	firstCategory,
	firstParentCategory,
	firstSubcategory,
	getValuesFrom,
	lastCategory,
	lastSubcategory,
	secondLastSubcategory,
	secondSubcategory
} from "~/support/categories/index";
import type { Category } from "~/support/categories/types";

describe("Category Delete", (): void => {
	let originalRowCount: number;

	function commonBehaviour(targetRow: string, targetRowAfter: string, isSubcategory = false, hasChildren = false): void {
		let	categoryToDelete: Category,
				categoryAfterDelete: Category;

		beforeEach((): void => {
			cy.get(targetRow).then((row: JQuery<HTMLTableRowElement>): Category => (categoryToDelete = getValuesFrom(row)));
			cy.get(targetRowAfter).then((row: JQuery<HTMLTableRowElement>): Category => (categoryAfterDelete = getValuesFrom(row)));
			cy.get(targetRow).click();
			cy.get("body").type("{del}");
			cy.get(categoryDeleteHeading).should("have.text", "Delete Category?");
		});

		it("should display the details of the category being deleted", (): void => {
			cy.contains(warningMessage).should(hasChildren ? "be.visible" : "not.exist");
			cy.get(categoryToDeleteName).should("have.text", categoryToDelete.name);
			if (isSubcategory) {
				cy.get(categoryToDeleteParent).should("have.text", categoryToDelete.parent);
			}
			cy.get(categoryToDeleteDirection).should("have.text", getDirectionLabel(categoryToDelete.direction));
		});

		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(categoryDeleteForm).should("not.exist");

			// Row count should not have changed
			cy.get(categoriesTableRows).should("have.length", originalRowCount);

			// Category in the target row should not have changed
			cy.get(targetRow).within((): void => checkRowMatches(categoryToDelete));
		});

		it("should delete an existing category when the delete button is clicked", (): void => {
			cy.get(deleteButton).click();
			cy.get(categoryDeleteForm).should("not.exist");

			// Row count should have decremented by one + the number of children
			cy.get(categoriesTableRows).should("have.length", originalRowCount - (hasChildren ? 3 : 1));

			// Category in the target row should have changed
			cy.get(targetRow).within((): void => checkRowMatches(categoryAfterDelete));
		});

		// MISSING - error message should display when present
	}

	before((): void => cy.createCategories());

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/categories");
		cy.get(categoriesTableRows).then((rows: JQuery<HTMLTableRowElement>): number => (originalRowCount = rows.length));
	});

	describe("deleting a category", (): void => {
		describe("parent", (): void => {
			describe("expense", (): void => commonBehaviour(lastCategory, lastSubcategory));
			describe("income", (): void => commonBehaviour(firstCategory, firstParentCategory, false, true));
		});

		describe("subcategory", (): void => {
			describe("expense", (): void => commonBehaviour(lastSubcategory, secondLastSubcategory, true));
			describe("income", (): void => commonBehaviour(firstSubcategory, secondSubcategory, true));
		});
	});
});