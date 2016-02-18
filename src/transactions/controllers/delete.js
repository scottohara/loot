{
	/**
	 * Implementation
	 */
	class TransactionDeleteController {
		constructor($uibModalInstance, transactionModel, transaction) {
			this.$uibModalInstance = $uibModalInstance;
			this.transactionModel = transactionModel;
			this.transaction = transaction;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteTransaction() {
			this.errorMessage = null;
			this.transactionModel.destroy(this.transaction).then(() => this.$uibModalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$uibModalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.controller("TransactionDeleteController", TransactionDeleteController);

	/**
	 * Dependencies
	 */
	TransactionDeleteController.$inject = ["$uibModalInstance", "transactionModel", "transaction"];
}
