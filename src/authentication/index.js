// Dependent modules
import "angular-ui-bootstrap";

// Components
import AuthenticationEditController from "./controllers/edit";
import AuthenticationModel from "./models/authentication";
import angular from "angular";

angular.module("lootAuthentication", [
	"ui.bootstrap"
])
	.controller("AuthenticationEditController", AuthenticationEditController)
	.service("authenticationModel", AuthenticationModel);