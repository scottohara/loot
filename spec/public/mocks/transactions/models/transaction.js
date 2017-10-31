import moment from "moment";

export default class TransactionModelMockProvider {
	constructor(transactionMockProvider, transactionBatchMockProvider, $qMockProvider) {
		// Success/error = options for the stub promises
		const	success = {
						args: {id: 1},
						response: transactionMockProvider.$get()
					},
					error = {
						args: {id: -1}
					},
					$q = $qMockProvider.$get();

		// Mock transactionModel object
		this.transactionModel = {
			all: $q.promisify({
				args: "/1",
				response: transactionBatchMockProvider.$get()
			}, {
				args: "/-1"
			}),
			query: $q.promisify({
				args: "search",
				response: transactionBatchMockProvider.$get()
			}, {
				args: "dontsearch"
			}),
			findSubtransactions: $q.promisify({
				response: [
					{id: 1, transaction_type: "Transfer", account: "subtransfer account"},
					{id: 2, category: "subtransaction category"},
					{id: 3, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
				]
			}, {
				args: -1
			}),
			find: $q.promisify({
				response: transactionMockProvider.$get()
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			updateStatus: $q.promisify(),
			flag: $q.promisify(success, error),
			unflag: $q.promisify(1, -1),
			allDetailsShown: sinon.stub().returns(true),
			showAllDetails: sinon.stub(),
			lastTransactionDate: moment().startOf("day").toDate()
		};
	}

	$get() {
		// Return the mock transactionModel object
		return this.transactionModel;
	}
}

TransactionModelMockProvider.$inject = ["transactionMockProvider", "transactionBatchMockProvider", "$qMockProvider"];