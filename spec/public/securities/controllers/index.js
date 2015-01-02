(function() {
	"use strict";

	/*jshint expr: true */

	describe("securityIndexController", function() {
		// The object under test
		var securityIndexController;

		// Dependencies
		var controllerTest,
				$timeout,
				$modal,
				$state,
				securityModel,
				securities;

		// Load the modules
		beforeEach(module("lootMocks", "securities", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modal", "$state", "securityModel", "securities"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$timeout_, _$modal_, _$state_, _securityModel_, _securities_) {
			controllerTest = _controllerTest_;
			$timeout = _$timeout_;
			$modal = _$modal_;
			$state = _$state_;
			securityModel = _securityModel_;
			securities = _securities_;
			securityIndexController = controllerTest("securityIndexController");
		}));

		it("should make the passed securities available on the $scope", function() {
			securityIndexController.securities.should.deep.equal(securities);
		});
			
		it("should return the sum of all security values, to 2 decimal places", function() {
			securityIndexController.totalValue.should.equal(45.01);
		});

		describe("editSecurity", function() {
			var security;

			beforeEach(function() {
				sinon.stub(securityIndexController, "focusSecurity");
				security = angular.copy(securityIndexController.securities[1]);
			});

			it("should disable navigation on the table", function() {
				securityIndexController.editSecurity();
				securityIndexController.navigationDisabled.should.be.true;
			});

			describe("(edit existing)", function() {
				beforeEach(function() {
					securityIndexController.editSecurity(1);
				});

				it("should open the edit security modal with a security", function() {
					$modal.open.should.have.been.called;
					securityModel.addRecent.should.have.been.calledWith(security);
					$modal.resolves.security.should.deep.equal(security);
				});
				
				it("should update the security in the list of securities when the modal is closed", function() {
					security.name = "edited security";
					$modal.close(security);
					securityIndexController.securities.should.include(security);
				});
			});

			describe("(add new)", function() {
				beforeEach(function() {
					security = {id: 999, name: "new security", current_holding: 0};
					securityIndexController.editSecurity();
				});

				it("should open the edit security modal without a security", function() {
					$modal.open.should.have.been.called;
					securityModel.addRecent.should.not.have.been.called;
					(undefined === $modal.resolves.security).should.be.true;
				});

				it("should add the new security to the list of securities when the modal is closed", function() {
					$modal.close(security);
					securityIndexController.securities.pop().should.deep.equal(security);
				});

				it("should add the new security to the recent list", function() {
					$modal.close(security);
					securityModel.addRecent.should.have.been.calledWith(security);
				});
			});

			it("should resort the securities list when the modal is closed", function() {
				var securityWithNoHoldingAndHighestName = angular.copy(securityIndexController.securities[7]);
				securityIndexController.editSecurity();
				$modal.close(security);
				securityIndexController.securities.pop().should.deep.equal(securityWithNoHoldingAndHighestName);
			});

			it("should focus the security when the modal is closed", function() {
				securityIndexController.editSecurity();
				$modal.close(security);
				securityIndexController.focusSecurity.should.have.been.calledWith(security.id);
			});

			it("should not change the securities list when the modal is dismissed", function() {
				var originalSecurities = angular.copy(securityIndexController.securities);
				securityIndexController.editSecurity();
				$modal.dismiss();
				securityIndexController.securities.should.deep.equal(originalSecurities);
			});

			it("should enable navigation on the table when the modal is closed", function() {
				securityIndexController.editSecurity();
				$modal.close(security);
				securityIndexController.navigationDisabled.should.be.false;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				securityIndexController.editSecurity();
				$modal.dismiss();
				securityIndexController.navigationDisabled.should.be.false;
			});
		});

		describe("deleteSecurity", function() {
			var security;

			beforeEach(function() {
				security = angular.copy(securityIndexController.securities[1]);
			});

			it("should fetch the security", function() {
				securityIndexController.deleteSecurity(1);
				securityModel.find.should.have.been.calledWith(security.id);
			});

			it("should disable navigation on the table", function() {
				securityIndexController.deleteSecurity(1);
				securityIndexController.navigationDisabled.should.be.true;
			});

			it("should show an alert if the security has transactions", function() {
				securityIndexController.deleteSecurity(2);
				$modal.open.should.have.been.called;
				$modal.resolves.alert.header.should.equal("Security has existing transactions");
			});

			it("should show the delete security modal if the security has no transactions", function() {
				securityIndexController.deleteSecurity(1);
				$modal.open.should.have.been.called;
				$modal.resolves.security.should.deep.equal(security);
			});

			it("should remove the security from the securities list when the modal is closed", function() {
				securityIndexController.deleteSecurity(1);
				$modal.close(security);
				securityIndexController.securities.should.not.include(security);
			});

			it("should transition to the securities list when the modal is closed", function() {
				securityIndexController.deleteSecurity(1);
				$modal.close(security);
				$state.go.should.have.been.calledWith("root.securities");
			});

			it("should enable navigation on the table when the modal is closed", function() {
				securityIndexController.deleteSecurity(1);
				$modal.close(security);
				securityIndexController.navigationDisabled.should.be.false;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				securityIndexController.deleteSecurity(1);
				$modal.dismiss();
				securityIndexController.navigationDisabled.should.be.false;
			});
		});

		describe("tableActions.navigationEnabled", function() {
			it("should return false when navigation is disabled locally", function() {
				securityIndexController.navigationDisabled = true;
				securityIndexController.tableActions.navigationEnabled().should.be.false;
			});

			it("should return false when navigation is disabled globally", function() {
				securityIndexController.navigationGloballyDisabled = true;
				securityIndexController.tableActions.navigationEnabled().should.be.false;
			});

			it("should return true when navigation is not disabled locally or globally", function() {
				securityIndexController.tableActions.navigationEnabled().should.be.true;
			});
		});

		describe("tableActions.selectAction", function() {
			it("should transition to the security transactions list", function() {
				securityIndexController.tableActions.selectAction();
				$state.go.should.have.been.calledWith(".transactions");
			});
		});

		describe("tableActions.editAction", function() {
			it("should edit the security", function() {
				securityIndexController.tableActions.editAction.should.equal(securityIndexController.editSecurity);
			});
		});

		describe("tableActions.insertAction", function() {
			it("should insert a security", function() {
				sinon.stub(securityIndexController, "editSecurity");
				securityIndexController.tableActions.insertAction();
				securityIndexController.editSecurity.should.have.been.calledWith(undefined);
			});
		});

		describe("tableActions.deleteAction", function() {
			it("should delete a security", function() {
				securityIndexController.tableActions.deleteAction.should.equal(securityIndexController.deleteSecurity);
			});
		});

		describe("tableActions.focusAction", function() {
			it("should focus a security when no security is currently focussed", function() {
				securityIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith(".security", {id: 2});
			});

			it("should focus a security when another security is currently focussed", function() {
				$state.currentState("**.security");
				securityIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith("^.security", {id: 2});
			});
		});

		describe("focusSecurity", function() {
			beforeEach(function() {
				securityIndexController.tableActions.focusRow = sinon.stub();
			});

			it("should do nothing when the specific security row could not be found", function() {
				(undefined === securityIndexController.focusSecurity(999)).should.be.true;
				securityIndexController.tableActions.focusRow.should.not.have.been.called;
			});

			it("should focus the security row for the specified security", function() {
				var targetIndex = securityIndexController.focusSecurity(1);
				$timeout.flush();
				securityIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
			});

			it("should return the index of the specified security", function() {
				var targetIndex = securityIndexController.focusSecurity(1);
				targetIndex.should.equal(0);
			});
		});

		describe("stateChangeSuccessHandler", function() {
			var toState,
					toParams,
					fromState,
					fromParams;

			beforeEach(function() {
				toState = {name: "state"};
				toParams = {id: 1};
				fromState = angular.copy(toState);
				fromParams = angular.copy(toParams);
				sinon.stub(securityIndexController, "focusSecurity");
			});

			it("should do nothing when an id state parameter is not specified", function() {
				delete toParams.id;
				securityIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				securityIndexController.focusSecurity.should.not.have.been.called;
			});

			it("should do nothing when state parameters have not changed", function() {
				securityIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				securityIndexController.focusSecurity.should.not.have.been.called;
			});

			it("should ensure the security is focussed when the state name changes", function() {
				toState.name = "new state";
				securityIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				securityIndexController.focusSecurity.should.have.been.calledWith(toParams.id);
			});

			it("should ensure the security is focussed when the security id state param changes", function() {
				toParams.id = 2;
				securityIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				securityIndexController.focusSecurity.should.have.been.calledWith(toParams.id);
			});
		});

		it("should attach a state change success handler", function() {
			sinon.stub(securityIndexController, "stateChangeSuccessHandler");
			securityIndexController.$emit("$stateChangeSuccess");
			securityIndexController.stateChangeSuccessHandler.should.have.been.called;
		});
	});
})();
