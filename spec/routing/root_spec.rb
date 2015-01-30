require 'spec_helper'

describe "default route" do
	it "should route GET / to accounts#index" do
		expect({get: "/"}).to route_to controller: "accounts", action: "index"
	end
end
