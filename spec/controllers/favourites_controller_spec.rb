# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'

::RSpec.describe ::FavouritesController do
	shared_context 'for account', :account do
		let(:context) { create(:account) }
		let(:request_params) { {'account_id' => '1'} }
	end

	shared_context 'for payee', :payee do
		let(:context) { ::Payee.new }
		let(:request_params) { {'payee_id' => '1'} }
	end

	shared_context 'for category', :category do
		let(:context) { ::Category.new }
		let(:request_params) { {'category_id' => '1'} }
	end

	shared_context 'for security', :security do
		let(:context) { ::Security.new }
		let(:request_params) { {'security_id' => '1'} }
	end

	before do
		expect(context.class).to receive(:find).with('1').and_return context
		expect(context).to receive(:update!).with favourite:
	end

	describe 'PATCH update', :request do
		let(:favourite) { true }
		let(:expected_status) { :no_content }

		before do
			patch :update, params: request_params
		end

		it('should favourite an account', :account) {} # Empty block
		it('should favourite a payee', :payee) {} # Empty block
		it('should favourite a category', :category) {} # Empty block
		it('should favourite a security', :security) {} # Empty block
	end

	describe 'DELETE destroy', :request do
		let(:favourite) { false }
		let(:expected_status) { :no_content }

		before do
			delete :destroy, params: request_params
		end

		it('should unfavourite an account', :account) {} # Empty block
		it('should favourite a payee', :payee) {} # Empty block
		it('should favourite a category', :category) {} # Empty block
		it('should favourite a security', :security) {} # Empty block
	end
end
