import {
	CategorisableTransaction,
	PayeeCashTransaction,
	SecurityTransaction,
	SubcategorisableTransaction
} from "transactions/types";
import {
	format,
	startOfDay
} from "date-fns/esm";
import CategoryModel from "categories/models/category";
import PayeeModel from "payees/models/payee";
import {ScheduledTransaction} from "schedules/types";
import SecurityModel from "securities/models/security";
import angular from "angular";

export default class ScheduleModel {
	public constructor(private readonly $http: angular.IHttpService,
											private readonly payeeModel: PayeeModel,
											private readonly categoryModel: CategoryModel,
											private readonly securityModel: SecurityModel) {}

	// Returns the API path
	public path(id?: number): string {
		return `/schedules${id ? `/${id}` : ""}`;
	}

	// Retrieves all schedules
	public all(): angular.IPromise<ScheduledTransaction[]> {
		return this.$http.get(this.path()).then((response: angular.IHttpResponse<ScheduledTransaction[]>): ScheduledTransaction[] => response.data.map(this.parse));
	}

	// Saves a schedule
	public save(schedule: ScheduledTransaction): angular.IPromise<ScheduledTransaction> {
		// If the payee, category, subcategory or security are new; flush the $http cache
		if ("string" === typeof (schedule as PayeeCashTransaction).payee) {
			this.payeeModel.flush();
		}

		if ("string" === typeof (schedule as CategorisableTransaction).category || "string" === typeof (schedule as SubcategorisableTransaction).subcategory) {
			this.categoryModel.flush();
		}

		if ("string" === typeof (schedule as SecurityTransaction).security) {
			this.securityModel.flush();
		}

		return this.$http({
			method: schedule.id ? "PATCH" : "POST",
			url: this.path(Number(schedule.id)),
			data: this.stringify(schedule)
		}).then((response: angular.IHttpResponse<ScheduledTransaction>): ScheduledTransaction => this.parse(response.data));
	}

	// Deletes a schedule
	public destroy(schedule: ScheduledTransaction): angular.IHttpPromise<void> {
		return this.$http.delete(this.path(Number(schedule.id)));
	}

	// Performs post-processing after parsing from JSON
	private parse(schedule: ScheduledTransaction): ScheduledTransaction {
		// Convert the next due date from a string ("YYYY-MM-DD") to a native JS date
		schedule.next_due_date = startOfDay(schedule.next_due_date);

		return schedule;
	}

	// Performs pre-processing before stringifying from JSON
	private stringify(schedule: ScheduledTransaction): ScheduledTransaction {
		// To avoid timezone issue, convert the native JS date back to a string ("YYYY-MM-DD") before saving
		const scheduleCopy = angular.copy(schedule);

		scheduleCopy.next_due_date = format(scheduleCopy.next_due_date, "YYYY-MM-DD");

		return scheduleCopy;
	}
}

ScheduleModel.$inject = ["$http", "payeeModel", "categoryModel", "securityModel"];