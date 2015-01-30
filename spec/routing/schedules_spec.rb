require 'spec_helper'

describe "schedules routes" do
	# Collection routes
	it "should route GET /schedules to schedules#index" do
		expect({get: "/schedules"}).to route_to controller: "schedules", action: "index"
	end

	it "should route POST /schedules to schedules#create" do
		expect({post: "/schedules"}).to route_to controller: "schedules", action: "create"
	end

	# Member routes
	it "should route PATCH /schedules/:id to schedules#update" do
		expect({patch: "/schedules/1"}).to route_to controller: "schedules", action: "update", id: "1"
	end

	it "should route PUT /schedules/:id to schedules#update" do
		expect({put: "/schedules/1"}).to route_to controller: "schedules", action: "update", id: "1"
	end

	it "should route DELETE /schedules/:id to schedules#update" do
		expect({delete: "/schedules/1"}).to route_to controller: "schedules", action: "destroy", id: "1"
	end

	it "should not route GET /schedules/:id" do
		expect({get: "/schedules/1"}).to route_to controller: "application", action: "routing_error", unmatched_route: "schedules/1"
	end

	it "should not route GET /schedules/:id/edit" do
		expect({get: "/schedules/1/edit"}).to route_to controller: "application", action: "routing_error", unmatched_route: "schedules/1/edit"
	end
end
