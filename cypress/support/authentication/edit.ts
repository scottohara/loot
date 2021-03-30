export const loginForm = "form[name=loginForm]";

const userNameInput = `${loginForm} #userName`,
			passwordInput = `${loginForm} input[name=password]`;

export const cancelButton = `${loginForm} button[type=button]`;
export const loginButton = `${loginForm} button[type=submit]`;
export const errorMessage = "Invalid login and/or password";
export const notLoggedInMessage = "You are not logged in. Click the Login button above to proceed.";

export function populateFormWith(userName: string, password: string): void {
	cy.get(userNameInput).clear().type(userName);
	cy.get(passwordInput).clear().type(password);
}