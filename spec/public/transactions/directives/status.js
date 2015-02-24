(function() {
	"use strict";

	/*jshint expr: true */

	describe("transactionStatus", function() {
		// The object under test
		var transactionStatus;

		// Dependencies
		var transactionModel;

		// Load the modules
		beforeEach(module("lootMocks", "lootTransactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["transactionModel"]);
		}));

		// Load the template
		beforeEach(module("transactions/views/status.html"));

		// Configure & compile the object under test
		beforeEach(inject(function(directiveTest, _transactionModel_) {
			transactionStatus = directiveTest;
			transactionStatus.configure("transaction-status", "div");
			transactionStatus.scope.model = {
				account: {
					id: 123
				},
				transaction: {
					id: 456,
				}
			};

			transactionModel = _transactionModel_;
		}));

		var scenarios = [
			{
				currentStatus: undefined,
				nextStatus: "Cleared",
				icon: "tag"
			},
			{
				currentStatus: null,
				nextStatus: "Cleared",
				icon: "tag"
			},
			{
				currentStatus: "Unreconciled",
				nextStatus: "Cleared",
				icon: "tag"
			},
			{
				currentStatus: "Reconciled",
				nextStatus: "Unreconciled",
				icon: "lock"
			},
			{
				currentStatus: "Cleared",
				nextStatus: "Reconciled",
				icon: "tag"
			},
			{
				currentStatus: "anything else",
				nextStatus: "Cleared",
				icon: "tag"
			}
		];

		// Helper function in lieu of beforeEach (which we can't use for dynamically generated specs)
		var setup = function(scenario) {
			transactionStatus.scope.model.transaction.status = scenario.currentStatus;
			transactionStatus.compile({"transaction-status": "model"});
			transactionStatus.scope.$digest();
		};

		scenarios.forEach(function(scenario) {
			if (!scenario.currentStatus) {
				it("should set the current status to 'Unreconciled' when the transaction status is " + String(scenario.currentStatus), function() {
					setup(scenario);
					transactionStatus.element.isolateScope().currentStatus.should.equal("Unreconciled");
				});
			}

			it("should set the next status to " + scenario.nextStatus + " when the current status is " + String(scenario.currentStatus), function() {
				setup(scenario);
				transactionStatus.element.isolateScope().nextStatus.should.equal(scenario.nextStatus);
			});

			it("should set the icon to " + scenario.icon + " when the current status is " + scenario.currentStatus, function() {
				setup(scenario);
				transactionStatus.element.isolateScope().icon.should.equal(scenario.icon);
			});
		});

		describe("element", function() {
			var i;

			beforeEach(function() {
				transactionStatus.compile({"transaction-status": "model"});
				transactionStatus.scope.$digest();
				i = transactionStatus.element.find("i");
			});

			it("should display the icon for the current status", function() {
				i.hasClass("glyphicon-tag").should.be.true;
			});

			it("should style the element according to the current status", function() {
				i.hasClass("unreconciled").should.be.true;
			});

			it("should be transparent when the current status is Unreconciled", function() {
				i.hasClass("active").should.be.false;
			});

			it("should be opaque when the current status is not Unreconciled", function() {
				transactionStatus.scope.model.transaction.status = "Cleared";
				transactionStatus.compile({"transaction-status": "model"});
				transactionStatus.scope.$digest();
				transactionStatus.element.find("i").hasClass("active").should.be.true;
			});

			it("should display a tooltip with the current and next status", function() {
				i.attr("tooltip-html-unsafe").should.equal("Status: <strong class='unreconciled'>Unreconciled</strong><br/>Click to mark as <strong class='cleared'>Cleared</strong>");
			});
		});

		describe("on click", function() {
			beforeEach(function() {
				transactionStatus.compile({"transaction-status": "model"});
				transactionStatus.scope.$digest();
			});

			it("should update the transaction status to the next status if not Unreconciled", function() {
				transactionStatus.element.isolateScope().nextStatus = "Cleared";
				transactionStatus.element.triggerHandler("click");
				transactionModel.updateStatus.should.have.been.calledWith("/accounts/123", 456, "Cleared");
			});

			it("should clear the transaction status if the next status is Unreconciled", function() {
				transactionStatus.element.isolateScope().nextStatus = "Unreconciled";
				transactionStatus.element.triggerHandler("click");
				transactionModel.updateStatus.should.have.been.calledWith("/accounts/123", 456, null);
			});

			it("should set the current status", function() {
				transactionStatus.element.isolateScope().currentStatus = "Cleared";
				transactionStatus.element.isolateScope().nextStatus = "Reconciled";
				transactionStatus.element.triggerHandler("click");
				transactionStatus.element.isolateScope().currentStatus.should.equal("Reconciled");
				transactionStatus.element.isolateScope().nextStatus.should.equal("Unreconciled");
			});
		});

		describe("on destroy", function() {
			beforeEach(function() {
				transactionStatus.compile({"transaction-status": "model"});
				transactionStatus.scope.$digest();
				sinon.stub(transactionStatus.element.isolateScope(), "clickHandler");
				transactionStatus.element.triggerHandler("$destroy");
			});

			it("should remove the click handler from the element", function() {
				transactionStatus.element.triggerHandler("click");
				transactionStatus.element.isolateScope().clickHandler.should.not.have.been.called;
			});
		});
	});
})();
