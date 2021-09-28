import {
	DIRECTION_INFLOW,
	DIRECTION_OUTFLOW
} from "./index";
import type { Category } from "./types";

export const categoryEditForm = "form[name=categoryForm]";
export const categoryEditHeading = `${categoryEditForm} > div.modal-header > h4`;

const categoryNameInput = `${categoryEditForm} #name`,
			categoryParentTypeahead = `${categoryEditForm} input[name=parent]`,
			categoryInflowRadioButton = `${categoryEditForm} i.${DIRECTION_INFLOW}`,
			categoryOutflowRadioButton = `${categoryEditForm} i.${DIRECTION_OUTFLOW}`;

export const cancelButton = `${categoryEditForm} button[type=button]`;
export const saveButton = `${categoryEditForm} button[type=submit]`;
export const errorMessage = "";

export function populateFormWith(category: Category): void {
	const { name, parent, direction } = category;

	cy.get(categoryNameInput).clear().type(name);

	if (undefined === parent) {
		if (direction === DIRECTION_INFLOW) {
			cy.get(categoryInflowRadioButton).click();
		} else {
			cy.get(categoryOutflowRadioButton).click();
		}
	} else {
		cy.typeahead(categoryParentTypeahead, parent);
	}
}

export function checkFormMatches(expectedValues: Category): void {
	const { name, parent, direction } = expectedValues;

	cy.get(categoryNameInput).should("have.value", name);
	if (undefined === parent) {
		if (direction === DIRECTION_INFLOW) {
			cy.get(categoryInflowRadioButton).parent().should("have.class", "active");
			cy.get(categoryOutflowRadioButton).parent().should("not.have.class", "active");
		} else {
			cy.get(categoryInflowRadioButton).parent().should("not.have.class", "active");
			cy.get(categoryOutflowRadioButton).parent().should("have.class", "active");
		}
	} else {
		cy.get(categoryParentTypeahead).should("have.value", parent);
	}
}

export function invalidateForm(): void {
	cy.get(categoryNameInput).clear();
}