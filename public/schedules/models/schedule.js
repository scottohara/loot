(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.factory("scheduleModel", Factory);

	/**
	 * Dependencies
	 */
	Factory.$inject = ["$http", "payeeModel", "categoryModel", "securityModel"];

	/**
	 * Implementation
	 */
	function Factory($http, payeeModel, categoryModel, securityModel) {
		var model = {};

		// Returns the API path
		model.path = function(id) {
			return "/schedules" + (id ? "/" + id : "");
		};

		// Performs post-processing after parsing from JSON
		model.parse = function(schedule) {
			// Convert the next due date from a string ("YYYY-MM-DD") to a native JS date
			schedule.next_due_date = moment(schedule.next_due_date).startOf("day").toDate();
			return schedule;
		};

		// Performs pre-processing before stringifying from JSON
		model.stringify = function(schedule) {
			// To avoid timezone issue, convert the native JS date back to a string ("YYYY-MM-DD") before saving
			var scheduleCopy = angular.copy(schedule);
			scheduleCopy.next_due_date = moment(scheduleCopy.next_due_date).format("YYYY-MM-DD");
			return scheduleCopy;
		};

		// Retrieves all schedules
		model.all = function() {
			return $http.get(model.path()).then(function(response) {
				return response.data.map(model.parse);
			});
		};

		// Saves a schedule
		model.save = function(schedule) {
			// If the payee, category, subcategory or security are new; flush the $http cache
			if (typeof schedule.payee === "string") {
				payeeModel.flush();
			}

			if (typeof schedule.category === "string" || typeof schedule.subcategory === "string") {
				categoryModel.flush();
			}

			if (typeof schedule.security === "string") {
				securityModel.flush();
			}

			return $http({
				method: schedule.id ? "PATCH" : "POST",
				url: model.path(schedule.id),
				data: model.stringify(schedule)
			}).then(function(response) {
				return model.parse(response.data);
			});
		};

		// Deletes a schedule
		model.destroy = function(schedule) {
			return $http.delete(model.path(schedule.id));
		};

		return model;
	}
})();
