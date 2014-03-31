class ApplicationController < ActionController::Base
  protect_from_forgery
	before_action :authenticate_user

	def authenticate_user
		render :text => "Invalid login and/or password", :status => :unauthorized unless authenticate_with_http_basic do |username, password|
			username.eql?(ENV[:LOOT_USERNAME.to_s]) && password.eql?(ENV[:LOOT_PASSWORD.to_s])
		end
	end
end
