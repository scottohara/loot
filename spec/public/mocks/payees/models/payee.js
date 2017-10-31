export default class PayeeModelMockProvider {
	constructor(payeeMockProvider, payeesMockProvider, $qMockProvider) {
		// Success/error = options for the stub promises
		const	success = {
						args: {id: 1},
						response: {data: payeeMockProvider.$get()}
					},
					error = {
						args: {id: -1}
					},
					$q = $qMockProvider.$get();

		// Mock payeeModel object
		this.payeeModel = {
			recent: "recent payees list",
			type: "payee",
			path(id) {
				return `/payees/${id}`;
			},
			all: $q.promisify({response: payeesMockProvider.$get()}),
			allList: $q.promisify({response: payeesMockProvider.$get()}),
			find(id) {
				// Get the matching payee
				const payee = payeesMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the payee
				return $q.promisify({response: payee})();
			},
			findLastTransaction: $q.promisify({
				response: {}
			}, {
				args: -1
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			toggleFavourite(payee) {
				return $q.promisify({response: !payee.favourite})();
			},
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		// Spy on find() and toggleFavourite()
		sinon.spy(this.payeeModel, "find");
		sinon.spy(this.payeeModel, "toggleFavourite");
	}

	$get() {
		// Return the mock payeeModel object
		return this.payeeModel;
	}
}

PayeeModelMockProvider.$inject = ["payeeMockProvider", "payeesMockProvider", "$qMockProvider"];