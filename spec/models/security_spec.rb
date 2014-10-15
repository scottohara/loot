require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Security, :type => :model do
	before :each do
		FactoryGirl.reload
	end

	it_behaves_like Transactable do
		let(:context_factory) { :security }
		let(:ledger_json_key) { :security }
		let(:expected_transactions_filter) { "" }
		let(:expected_closing_balances) { {:with_date => 1, :without_date => 0 } }
	end

	describe "::find_or_new" do
		context "existing security" do
			let(:security) { create :security }

			it "should return the existing security" do
				expect(Security.find_or_new({"id" => security.id})).to eq security
			end
		end

		context "new security" do
			let(:security_name) { "New security" }

			it "should return a newly created security" do
				expect(Security.find_or_new(security_name).name).to eq security_name
			end
		end
	end

	describe "#price" do
		subject { create :security }

		# Prices before the target date
		before :each, :earlier_prices do
			(1..5).each {|i| subject.update_price!(i,  as_at - i, nil) }
		end

		# Prices after the target date
		before :each do
			(1..5).each {|i| subject.update_price!(i,  as_at + i, nil) }
		end

		context "when a date is passed" do
			let(:as_at) { Date.parse "2014-01-01" }

			context "and prices exist before or on that date", :earlier_prices => true do
				it "should return the latest price as at the passed date" do
					expect(subject.price as_at).to eq 1
				end
			end

			context "and prices do not exist before or on that date" do
				it "should return zero" do
					expect(subject.price as_at).to eq 0
				end
			end
		end

		context "when a date is not passed" do
			let(:as_at) { Date.today }

			context "and prices exist before or on the current date", :earlier_prices => true do
				it "should return the latest price as at the current date" do
					expect(subject.price).to eq 1
				end
			end

			context "and prices do not exist before or on the current date" do
				it "should return zero" do
					expect(subject.price).to eq 0
				end
			end
		end
	end

	describe "#update_price!" do
		subject { create :security }
		let(:price) { 100 }
		let(:as_at) { Date.parse "2014-01-01" }

		before :each do
			subject.update_price! price, as_at, nil
		end

		context "when a price already exists for the date" do
			let!(:existing_price) { subject.prices.where(:as_at_date => as_at).first }
			let(:new_price) { 200 }
			let!(:first_transaction) { create :security_holding_transaction, security: subject, transaction_date: as_at }
			let!(:second_transaction) { create :security_holding_transaction, security: subject, transaction_date: as_at }

			context "and this transaction represents the 'most recent' price" do
				it "should update the existing price" do
					subject.update_price! new_price, as_at, second_transaction.id
					expect(subject.price as_at).to eq new_price
				end
			end

			context "and this transaction does not represent the 'most recent' price" do
				it "should not update the existing price" do
					subject.update_price! new_price, as_at, first_transaction.id
					expect(subject.price as_at).to eq price
				end
			end
		end

		context "when a price doesn't exist for the date" do
			it "should create a new price" do
				expect(subject.price as_at).to eq price
			end
		end
	end

	describe "#opening_balance" do
		subject { create(:security) }

		it "should return zero" do
			expect(subject.opening_balance).to eq 0
		end
	end

	describe "#account_type" do
		subject { create(:security) }
		
		it "should return 'investment'" do
			expect(subject.account_type).to eq "investment"
		end
	end

	describe "#related_account" do
		subject { create(:security) }
		
		it "should return nil" do
			expect(subject.related_account).to be_nil
		end
	end

	describe "#as_json" do
		subject { create(:security, name: "Test Security", code: "TEST", transactions: 1) }
		let(:json) { subject.as_json }

		it "should return a JSON representation" do
			expect(json).to include(:id => subject.id)
			expect(json).to include(:name => "Test Security")
			expect(json).to include(:code => "TEST")
			expect(json).to include(:closing_balance => subject.closing_balance)
			expect(json).to include(:num_transactions => 1)
		end
	end
end
