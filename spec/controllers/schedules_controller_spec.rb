# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::SchedulesController do
	describe 'GET index', :json, :request do
		let(:json) { 'schedule ledger' }

		it 'should return the schedule ledger' do
			expect(::Schedule).to receive(:ledger).and_return json
			get :index
		end
	end

	describe 'POST create', :json, :request do
		let(:json) { 'created schedule' }

		it 'should create a new schedule of the specified type and return the details' do
			expect(controller).to receive(:clean).and_call_original
			expect(controller).to receive(:create_schedule).and_return json
			post :create, params: {primary_account: {id: 1}}
		end
	end

	describe 'PATCH update', :json, :request do
		let(:schedule) { create(:basic_transaction, :scheduled) }
		let(:json) { 'updated schedule' }

		before do
			expect(controller).to receive(:clean).and_call_original
			expect(::Transaction).to receive(:find).with('1').and_return schedule
		end

		after do
			patch :update, params: request_body
		end

		context "when transaction type hasn't changed" do
			let(:request_body) { {id: '1', transaction_type: 'Basic', transaction_date: nil, account_id: '1', primary_account: {id: '1'}, controller: 'schedules', action: 'update'} }

			it 'should update the existing transaction' do
				expect(::BasicTransaction).to receive(:update_from_json).with(::ActionController::Parameters.new request_body).and_return json
			end
		end

		context 'when transaction type has changed' do
			let(:request_body) { {id: '1', transaction_type: 'Transfer', primary_account: {id: '1'}} }

			it 'should destroy and recreate the transaction' do
				expect(schedule).to receive(:as_subclass).and_return schedule
				expect(schedule).to receive :destroy!
				expect(controller).to receive(:create_schedule).and_return json
			end
		end
	end

	describe 'DELETE destroy', :request do
		let(:schedule) { create(:basic_transaction, :scheduled) }

		it 'should delete an existing schedule' do
			expect(::Transaction).to receive(:find).with('1').and_return schedule
			expect(schedule).to receive(:as_subclass).and_return schedule
			expect(schedule).to receive :destroy!
			delete :destroy, params: {id: '1'}
		end
	end

	describe '#clean' do
		it 'should remove any empty or nil values from the passed parameters, clear the transaction date and copy the account id' do
			controller.params = ::ActionController::Parameters.new(
				a: 'a',
				b: '',
				c: nil,
				'transaction_date' => ::Time.zone.today.to_s,
				'primary_account' => {'id' => 1}
			)

			controller.clean
			expect(assigns(:schedule).to_unsafe_h).to eq(
				'a' => 'a',
				'transaction_date' => nil,
				'account_id' => 1,
				'primary_account' => {'id' => 1}
			)
		end
	end

	describe '#create_schedule' do
		it 'should create a schedule from the JSON in the request body' do
			controller.params = ::ActionController::Parameters.new('transaction_type' => 'Basic', 'primary_account' => {'id' => 1})
			expect(::BasicTransaction).to receive(:create_from_json).with controller.params.merge(transaction_date: nil, account_id: 1)

			controller.clean
			controller.create_schedule
		end
	end
end
