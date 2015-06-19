{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($modalInstance, payeeModel, payee) {
			this.$modalInstance = $modalInstance;
			this.payeeModel = payeeModel;
			this.payee = payee;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deletePayee() {
			this.errorMessage = null;
			this.payeeModel.destroy(this.payee).then(() => this.$modalInstance.close(), error => this.errorMessage = error.data);
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
		.module("lootPayees")
		.controller("PayeeDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "payeeModel", "payee"];
}
