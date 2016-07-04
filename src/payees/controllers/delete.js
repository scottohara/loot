{
	/**
	 * Implementation
	 */
	class PayeeDeleteController {
		constructor($uibModalInstance, payeeModel, payee) {
			this.$uibModalInstance = $uibModalInstance;
			this.payeeModel = payeeModel;
			this.payee = payee;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deletePayee() {
			this.errorMessage = null;
			this.payeeModel.destroy(this.payee).then(() => this.$uibModalInstance.close(), error => (this.errorMessage = error.data));
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
		.module("lootPayees")
		.controller("PayeeDeleteController", PayeeDeleteController);

	/**
	 * Dependencies
	 */
	PayeeDeleteController.$inject = ["$uibModalInstance", "payeeModel", "payee"];
}
