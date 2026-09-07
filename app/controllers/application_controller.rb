# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# Application controller
class ApplicationController < ::ActionController::API
	before_action :authenticate_user, except: [:routing_error]
	rescue_from ::StandardError, with: :internal_error
	rescue_from ::ActiveRecord::InvalidForeignKey, with: :invalid_foreign_key
	rescue_from ::ActiveRecord::RecordInvalid, with: :record_invalid
	rescue_from ::ActiveRecord::RecordNotDestroyed, with: :record_not_destroyed
	rescue_from ::ActiveRecord::RecordNotFound, with: :record_not_found
	rescue_from ::ActiveRecord::SubclassNotFound, with: :subclass_not_found
	include ::ActionController::HttpAuthentication::Basic::ControllerMethods

	def routing_error
		render plain: "Path #{params[:unmatched_route]} is not valid", status: :not_found
	end

	private

	def authenticate_user
		render plain: 'Invalid login and/or password', status: :unauthorized unless authenticate_with_http_basic do |username, password|
			::ActiveSupport::SecurityUtils.secure_compare(username.to_s, required_env_variable('LOOT_USERNAME')) & ::ActiveSupport::SecurityUtils.secure_compare(password.to_s, required_env_variable('LOOT_PASSWORD'))
		end
	end

	def required_env_variable(variable)
		value = ::ENV[variable]
		raise ::KeyError, "#{variable} environment variable must be set" if value.blank?

		value
	end

	def internal_error(exception)
		render plain: exception.message, status: :internal_server_error
	end

	def invalid_foreign_key(exception)
		render plain: exception.message, status: :unprocessable_content
	end

	def record_invalid(exception)
		render plain: exception.record.errors.full_messages.join(', '), status: :unprocessable_content
	end

	def record_not_destroyed(exception)
		render plain: exception.record.errors.full_messages.join(', '), status: :conflict
	end

	def record_not_found(exception)
		render plain: exception.message, status: :not_found
	end

	def subclass_not_found(exception)
		render plain: exception.message, status: :bad_request
	end
end
