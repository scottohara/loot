// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "og-components";

// Components
import SecurityDeleteController from "./controllers/delete";
import SecurityEditController from "./controllers/edit";
import SecurityIndexController from "./controllers/index";
import SecurityModel from "./models/security";
import angular from "angular";

angular.module("lootSecurities", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents"
])
	.controller("SecurityDeleteController", SecurityDeleteController)
	.controller("SecurityEditController", SecurityEditController)
	.controller("SecurityIndexController", SecurityIndexController)
	.service("securityModel", SecurityModel);