import {
	DIRECTION_INFLOW,
	DIRECTION_OUTFLOW,
	categoriesTableRows,
	checkRowMatches,
	editButton,
	favouriteButton
} from "categories/index";
import {
	categoryDeleteForm,
	categoryDeleteHeading
} from "categories/delete";
import {
	categoryEditForm,
	categoryEditHeading
} from "categories/edit";
import {
	transactionsIndexHeading,
	transactionsTable
} from "transactions";
import { Category } from "categories/types";
import { testNavigableTable } from "og-components/og-table-navigable";

describe("Category Index", (): void => {
	let expected: Category[];

	before((): void => {
		expected = [];
		for (let i = 1; i <= 10; i += 3) {
			expected.push({ direction: DIRECTION_INFLOW, name: `Category ${i}` });
			expected.push({ direction: DIRECTION_INFLOW, name: `Category ${i + 1}`, parent: `Category ${i}` });
			expected.push({ direction: DIRECTION_INFLOW, name: `Category ${i + 2}`, parent: `Category ${i}` });
		}

		for (let i = 13; i <= 19; i += 3) {
			expected.push({ direction: DIRECTION_OUTFLOW, name: `Category ${i}` });
			expected.push({ direction: DIRECTION_OUTFLOW, name: `Category ${i + 1}`, parent: `Category ${i}` });
			expected.push({ direction: DIRECTION_OUTFLOW, name: `Category ${i + 2}`, parent: `Category ${i}` });
		}

		expected.push({ direction: DIRECTION_OUTFLOW, name: "Category 22", favourite: true });
		expected = expected.sort((a: Category, b: Category): number => {
			let x: string, y: string;

			if (a.direction === b.direction) {
				x = undefined === a.parent ? a.name : `${a.parent}#${a.name}`;
				y = undefined === b.parent ? b.name : `${b.parent}#${b.name}`;
			} else {
				x = b.direction;
				y = a.direction;
			}

			return x.localeCompare(y);
		});

		cy.createCategories();
	});

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/categories");
	});

	it("should display a row for each category", (): void => {
		// Number of rows
		cy.get(categoriesTableRows).should("have.length", expected.length);

		cy.get(categoriesTableRows).each((row: HTMLTableRowElement, index: number): void => {
			cy.wrap(row).within((): void => checkRowMatches(expected[index]));
		});
	});

	it("should toggle the favourite status of a category", (): void => {
		cy.get(categoriesTableRows).first().within((): void => {
			cy.get(favouriteButton).should("not.have.class", "active");
			cy.get(favouriteButton).click();
			cy.get(favouriteButton).should("have.class", "active");
			cy.get(favouriteButton).click();
			cy.get(favouriteButton).should("not.have.class", "active");
		});
	});

	testNavigableTable({
		rows: categoriesTableRows,
		actions: {
			insert: {
				heading: categoryEditHeading,
				headingText: "Add Category",
				view: categoryEditForm
			},
			edit: {
				heading: categoryEditHeading,
				headingText: "Edit Category",
				view: categoryEditForm,
				mouseAction: {
					name: "edit icon is clicked",
					perform: (row: number): Cypress.Chainable<JQuery> => cy.get(categoriesTableRows).eq(row).within((): void => {
						cy.get(editButton).click();
					})
				}
			},
			del: {
				heading: categoryDeleteHeading,
				headingText: "Delete Category?",
				view: categoryDeleteForm
			},
			select: {
				heading: transactionsIndexHeading,
				headingText: "Category 22",
				headingText2: " Transactions",
				view: transactionsTable,
				url: /#!\/categories\/\d+\/transactions/u
			}
		}
	});
});