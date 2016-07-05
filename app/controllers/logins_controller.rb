class LoginsController < ApplicationController
	respond_to :json

	def create
		# After login, check for any overdue schedules to be automatically entered
		Schedule.auto_enter_overdue

		head :created
	end
end
