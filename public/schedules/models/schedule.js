(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('schedules');

	// Declare the Schedule model
	mod.factory('scheduleModel', ['$http', 'payeeModel', 'categoryModel', 'securityModel',
		function($http, payeeModel, categoryModel, securityModel) {
			var model = {};

			// Retrieves all schedules
			model.all = function() {
				return $http.get('/schedules').then(function(response) {
					return response.data;
				});
			};

			// Saves a schedule
			model.save = function(schedule) {
				// If the payee, category, subcategory or security are new; flush the $http cache
				if (typeof schedule.payee === 'string') {
					payeeModel.flush();
				}

				if (typeof schedule.category === 'string' || typeof schedule.subcategory === 'string') {
					categoryModel.flush();
				}

				if (typeof schedule.security === 'string') {
					securityModel.flush();
				}

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
