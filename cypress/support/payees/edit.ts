import type { Payee } from "./types";

export const payeeEditForm = "form[name=payeeForm]";
export const payeeEditHeading = `${payeeEditForm} > div.modal-header > h4`;

const payeeNameInput = `${payeeEditForm} #name`;

export const cancelButton = `${payeeEditForm} button[type=button]`;
export const saveButton = `${payeeEditForm} button[type=submit]`;
export const errorMessage = "";

export function populateFormWith(payee: Payee): void {
	const { name } = payee;

	cy.get(payeeNameInput).clear().type(name);
}

export function checkFormMatches(expectedValues: Payee): void {
	const { name } = expectedValues;

	cy.get(payeeNameInput).should("have.value", name);
}

export function invalidateForm(): void {
	cy.get(payeeNameInput).clear();
}