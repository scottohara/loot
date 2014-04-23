(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('schedules');

	// Declare the Schedule model
	mod.factory('scheduleModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves all schedules
			model.all = function() {
				return $http.get('/schedules').then(function(response) {
					return response.data;
				});
			};

			// Saves a schedule
			model.save = function(schedule) {
				console.log("scheduleModel.save", schedule);
				return $http({
					method: schedule.id ? 'PATCH' : 'POST',
					url: '/schedules' + (schedule.id ? '/' + schedule.id : ''),
					data: schedule
				});
			};

			// Deletes a schedule
			model.destroy = function(schedule) {
				return $http.delete('/schedules/' + schedule.id);
			};

			return model;
		}
	]);
})();
