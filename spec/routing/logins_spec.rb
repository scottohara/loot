require 'spec_helper'

describe "logins routes" do
	# Collection routes
	it "should route POST /logins to logins#create" do
		expect({:post => "/logins"}).to route_to :controller => "logins", :action => "create"
	end

	it "should not route GET /logins" do
		expect({:get => "/logins"}).to route_to :controller => "application", :action => "routing_error", :unmatched_route => "logins"
	end

	# Member routes
	it "should not route GET /logins/:id" do
		expect({:get => "/logins/1"}).to route_to :controller => "application", :action => "routing_error", :unmatched_route => "logins/1"
	end

	it "should not route GET /logins/:id/edit" do
		expect({:get => "/logins/1/edit"}).to route_to :controller => "application", :action => "routing_error", :unmatched_route => "logins/1/edit"
	end

	it "should not route PATCH /logins/:id" do
		expect({:patch => "/logins/1"}).to_not be_routable
	end

	it "should not route PUT /logins/:id" do
		expect({:put => "/logins/1"}).to_not be_routable
	end

	it "should not route DELETE /logins/:id" do
		expect({:delete => "/logins/1"}).to_not be_routable
	end
end
