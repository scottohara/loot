{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($modalInstance, transactionModel, transaction) {
			this.$modalInstance = $modalInstance;
			this.transactionModel = transactionModel;
			this.transaction = transaction;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteTransaction() {
			this.errorMessage = null;
			this.transactionModel.destroy(this.transaction).then(() => this.$modalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.controller("TransactionDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "transactionModel", "transaction"];
}
