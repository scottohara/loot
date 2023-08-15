// Dependent modules
import "angular-ui-bootstrap";

// Components
import AuthenticationEditController from "~/authentication/controllers/edit";
import AuthenticationModel from "~/authentication/models/authentication";
import angular from "angular";

angular.module("lootAuthentication", [
	"ui.bootstrap"
])
	.controller("AuthenticationEditController", AuthenticationEditController)
	.service("authenticationModel", AuthenticationModel);