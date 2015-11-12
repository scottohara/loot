{
	/**
	 * Implementation
	 */
	class TransactionFlagController {
		constructor($modalInstance, transactionModel, transaction) {
			this.$modalInstance = $modalInstance;
			this.transactionModel = transactionModel;
			this.transaction = transaction;
			this.flag = "(no memo)" === transaction.flag ? null : transaction.flag;
			this.flagged = Boolean(transaction.flag);
			this.errorMessage = null;
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;
			this.transaction.flag = this.flag && this.flag || "(no memo)";
			this.transactionModel.flag(this.transaction).then(() => this.$modalInstance.close(this.transaction), error => this.errorMessage = error.data);
		}

		// Delete and close the modal
		deleteFlag() {
			this.errorMessage = null;
			this.transactionModel.unflag(this.transaction.id).then(() => {
				this.transaction.flag = null;
				this.$modalInstance.close(this.transaction);
			}, error => this.errorMessage = error.data);
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
		.controller("TransactionFlagController", TransactionFlagController);

	/**
	 * Dependencies
	 */
	TransactionFlagController.$inject = ["$modalInstance", "transactionModel", "transaction"];
}
