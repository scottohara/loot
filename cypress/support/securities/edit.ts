import type { Security } from "./types";

export const securityEditForm = "form[name=securityForm]";
export const securityEditHeading = `${securityEditForm} > div.modal-header > h4`;

const securityNameInput = `${securityEditForm} #name`,
			securityCodeInput = `${securityEditForm} #code`;

export const cancelButton = `${securityEditForm} button[type=button]`;
export const saveButton = `${securityEditForm} button[type=submit]`;

export function populateFormWith(security: Security): void {
	const { name, code } = security;

	cy.get(securityNameInput).clear().type(name);
	cy.get(securityCodeInput).clear().type(code);
}

export function checkFormMatches(expectedValues: Security): void {
	const { name, code } = expectedValues;

	cy.get(securityNameInput).should("have.value", name);
	cy.get(securityCodeInput).should("have.value", code);
}

export function invalidateForm(): void {
	cy.get(securityNameInput).clear();
	cy.get(securityCodeInput).clear();
}