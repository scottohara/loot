{
	/**
	 * Implementation
	 */
	class Factory {
		constructor($http, payeeModel, categoryModel, securityModel) {
			this.$http = $http;
			this.payeeModel = payeeModel;
			this.categoryModel = categoryModel;
			this.securityModel = securityModel;
		}

		// Returns the API path
		path(id) {
			return `/schedules${id ? `/${id}` : ""}`;
		}

		// Performs post-processing after parsing from JSON
		parse(schedule) {
			// Convert the next due date from a string ("YYYY-MM-DD") to a native JS date
			schedule.next_due_date = moment(schedule.next_due_date).startOf("day").toDate();
			return schedule;
		}

		// Performs pre-processing before stringifying from JSON
		stringify(schedule) {
			// To avoid timezone issue, convert the native JS date back to a string ("YYYY-MM-DD") before saving
			const scheduleCopy = angular.copy(schedule);

			scheduleCopy.next_due_date = moment(scheduleCopy.next_due_date).format("YYYY-MM-DD");
			return scheduleCopy;
		}

		// Retrieves all schedules
		all() {
			return this.$http.get(this.path()).then(response => response.data.map(this.parse));
		}

		// Saves a schedule
		save(schedule) {
			// If the payee, category, subcategory or security are new; flush the $http cache
			if ("string" === typeof schedule.payee) {
				this.payeeModel.flush();
			}

			if ("string" === typeof schedule.category || "string" === typeof schedule.subcategory) {
				this.categoryModel.flush();
			}

			if ("string" === typeof schedule.security) {
				this.securityModel.flush();
			}

			return this.$http({
				method: schedule.id ? "PATCH" : "POST",
				url: this.path(schedule.id),
				data: this.stringify(schedule)
			}).then(response => this.parse(response.data));
		}

		// Deletes a schedule
		destroy(schedule) {
			return this.$http.delete(this.path(schedule.id));
		}

		static factory($http, payeeModel, categoryModel, securityModel) {
			return new Factory($http, payeeModel, categoryModel, securityModel);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.factory("scheduleModel", Factory.factory);

	/**
	 * Dependencies
	 */
	Factory.factory.$inject = ["$http", "payeeModel", "categoryModel", "securityModel"];
}
