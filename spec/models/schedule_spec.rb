require 'rails_helper'
require 'models/concerns/categorisable'
require 'models/concerns/measurable'

RSpec.describe Schedule, :type => :model do
	it_behaves_like Categorisable
	it_behaves_like Measurable

	describe "#as_json" do
		subject { create :schedule, next_due_date: Date.today.to_s, frequency: "Yearly", estimate: false, auto_enter: false }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(:next_due_date => Date.today)
			expect(json).to include(:frequency => "Yearly")
			expect(json).to include(:estimate => false)
			expect(json).to include(:auto_enter => false)
		end
	end
end
