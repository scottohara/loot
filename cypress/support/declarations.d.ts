declare namespace Cypress {
	interface Chainable {
		login: () => void;
		createAccounts: () => void;
		createCategories: () => void;
		createPayees: () => void;
		createSecurities: () => void;
		createSchedules: () => void;
		createTransactions: () => void;
		typeahead: (typeahead: string, searchText: string) => void;
	}
}
