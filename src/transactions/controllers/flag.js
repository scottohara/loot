{
	/**
	 * Implementation
	 */
	class TransactionFlagController {
		constructor($uibModalInstance, transactionModel, transaction) {
			this.$uibModalInstance = $uibModalInstance;
			this.transactionModel = transactionModel;
			this.transaction = transaction;
			this.flag = "(no memo)" === transaction.flag ? null : transaction.flag;
			this.flagged = Boolean(transaction.flag);
			this.errorMessage = null;
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;
			this.transaction.flag = (this.flag && this.flag) || "(no memo)";
			this.transactionModel.flag(this.transaction).then(() => this.$uibModalInstance.close(this.transaction), error => (this.errorMessage = error.data));
		}

		// Delete and close the modal
		deleteFlag() {
			this.errorMessage = null;
			this.transactionModel.unflag(this.transaction.id).then(() => {
				this.transaction.flag = null;
				this.$uibModalInstance.close(this.transaction);
			}, error => (this.errorMessage = error.data));
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
		.controller("TransactionFlagController", TransactionFlagController);

	/**
	 * Dependencies
	 */
	TransactionFlagController.$inject = ["$uibModalInstance", "transactionModel", "transaction"];
}
