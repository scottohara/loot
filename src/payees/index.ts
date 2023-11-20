// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "~/og-components";

// Components
import PayeeDeleteController from "~/payees/controllers/delete";
import PayeeEditController from "~/payees/controllers/edit";
import PayeeIndexController from "~/payees/controllers/index";
import PayeeModel from "~/payees/models/payee";
import angular from "angular";

angular
	.module("lootPayees", ["ui.bootstrap", "ui.router", "ogComponents"])
	.controller("PayeeDeleteController", PayeeDeleteController)
	.controller("PayeeEditController", PayeeEditController)
	.controller("PayeeIndexController", PayeeIndexController)
	.service("payeeModel", PayeeModel);
