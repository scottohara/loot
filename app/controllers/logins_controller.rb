class LoginsController < ApplicationController
	def create
		# After login, check for any overdue schedules to be automatically entered
		Schedule.auto_enter_overdue

		head :created
	end
end
