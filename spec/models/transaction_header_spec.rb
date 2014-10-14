require 'rails_helper'

RSpec.describe TransactionHeader, :type => :model do
	matcher :match_json do |expected|
		match do |actual|
			actual.transaction_date.eql? expected['transaction_date']
		end
	end

	describe "#update_from_json" do
		let(:header) { create :transaction_header }
		let(:json) { {
			"next_due_date" => Date.today,
			"frequency" => "Weekly",
			"estimate" => true,
			"auto_enter" => true
		} }

		context "unscheduled" do
			before :each do
				json['transaction_date'] = Date.today
			end

			it "should update a transaction header from a JSON representation" do; end

			context "when previously scheduled" do
				let(:header) { create :transaction_header, :scheduled }

				it "should destroy the previous schedule" do
					expect(header.schedule).to receive(:destroy)
				end
			end
		end

		context "scheduled" do
			let(:schedule) { header.schedule || create(:schedule) }

			it "should update a transaction header from a JSON representation" do
				expect(header).to receive(:build_schedule).and_return schedule
			end

			context "when previously scheduled" do
				let(:header) { create :transaction_header, :scheduled }

				it "should update the existing schedule" do
					expect(header).to_not receive(:build_schedule)
				end
			end

			after :each do
				expect(schedule).to receive(:assign_attributes).with(:next_due_date => json['next_due_date'], :frequency => json['frequency'], :estimate => !!json['estimate'], :auto_enter => !!json['auto_enter'])
			end
		end

		after :each do
			expect(header.update_from_json(json)).to match_json json
		end
	end

	describe "#as_json" do
		let(:json) { subject.as_json }

		context "unscheduled" do
			subject { create(:transaction_header) }

			it "should return a JSON representation" do; end
		end

		context "scheduled" do
			subject { create(:transaction_header, :scheduled) }

			before :each do
				expect(subject.schedule).to receive(:as_json).and_return(:schedule => "schedule json")
			end

			it "should return a JSON representation" do
				expect(json).to include(:schedule => "schedule json")
			end
		end

		after :each do
			expect(json).to include(:transaction_date => subject.transaction_date)
		end
	end
end
