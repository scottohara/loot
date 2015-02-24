(function() {
	"use strict";

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

	/**
	 * Implementation
	 */
	function Controller($modalInstance, transactionModel, transaction) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.transaction = transaction;
		vm.deleteTransaction = deleteTransaction;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Delete and close the modal
		function deleteTransaction() {
			vm.errorMessage = null;
			transactionModel.destroy(vm.transaction).then(function() {
				$modalInstance.close();
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Dismiss the modal without deleting
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
