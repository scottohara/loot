// Dependent modules
import "angular-ui-bootstrap";
import "~/og-components";

// Components
import AccountDeleteController from "~/accounts/controllers/delete";
import AccountEditController from "~/accounts/controllers/edit";
import AccountIndexController from "~/accounts/controllers/index";
import AccountModel from "~/accounts/models/account";
import AccountReconcileController from "~/accounts/controllers/reconcile";
import angular from "angular";

angular.module("lootAccounts", [
	"ui.bootstrap",
	"ogComponents"
])
	.controller("AccountDeleteController", AccountDeleteController)
	.controller("AccountEditController", AccountEditController)
	.controller("AccountIndexController", AccountIndexController)
	.controller("AccountReconcileController", AccountReconcileController)
	.service("accountModel", AccountModel);