# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Logins controller
class LoginsController < ApplicationController
	def create
		# After login, check for any overdue schedules to be automatically entered
		Schedule.auto_enter_overdue

		head :created
	end
end
