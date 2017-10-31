// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "og-components";

// Components
import PayeeDeleteController from "./controllers/delete";
import PayeeEditController from "./controllers/edit";
import PayeeIndexController from "./controllers/index";
import PayeeModel from "./models/payee";
import angular from "angular";

angular.module("lootPayees", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents"
])
	.controller("PayeeDeleteController", PayeeDeleteController)
	.controller("PayeeEditController", PayeeEditController)
	.controller("PayeeIndexController", PayeeIndexController)
	.service("payeeModel", PayeeModel);