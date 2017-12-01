// Dependent modules
import "angular-ui-bootstrap";
import "og-components";

// Components
import AccountDeleteController from "./controllers/delete";
import AccountEditController from "./controllers/edit";
import AccountIndexController from "./controllers/index";
import AccountModel from "./models/account";
import AccountReconcileController from "./controllers/reconcile";
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