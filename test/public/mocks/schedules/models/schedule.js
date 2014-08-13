(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("schedulesMocks");

	// Declare the scheduleModelMock provider
	mod.provider("scheduleModelMock", function() {
		var provider = this;

		// Mock scheduleModel object
		provider.scheduleModel = {
			destroy: sinon.stub()
		};

		// Successful destroy response
		provider.scheduleModel.destroy.withArgs({id: 1}).returns({
			then: function(successCallback) {
				successCallback();
			}
		});

		// Unsuccessful destroy response
		provider.scheduleModel.destroy.withArgs({id: -1}).returns({
			then: function(successCallback, errorCallback) {
				errorCallback({data: "delete unsuccessful"});
			}
		});

		provider.$get = function() {
			// Return the mock scheduleModel object
			return provider.scheduleModel;
		};
	});

	// Declare the scheduleMock provider
	mod.provider("scheduleMock", function() {
		var provider = this;

		// Mock schedule object
		provider.schedule = {id: 1};

		provider.$get = function() {
			// Return the mock schedule object
			return provider.schedule;
		};
	});
})();
