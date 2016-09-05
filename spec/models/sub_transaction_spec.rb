# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true
require 'rails_helper'

RSpec.describe SubTransaction, type: :model do
	matcher :match_json do |expected, category|
		match do |actual|
			actual.transaction_type.eql?('Sub') &&
				actual.amount.eql?(expected['amount']) &&
				actual.memo.eql?(expected['memo']) &&
				actual.transaction_category.category.eql?(category)
		end
	end

	describe '::create_from_json' do
		let(:category) { create :category }
		let(:subcategory) { create :subcategory, parent: category }
		let(:json) do
			{
				'amount' => 1,
				'memo' => 'Test json',
				'category' => {
					'id' => category.id
				}
			}
		end

		before :each do
			expect(Category).to receive(:find_or_new).with(json['category']).and_return category
		end

		context 'with category' do
			it 'should create a transaction from a JSON representation' do
				expect(SubTransaction.create_from_json json).to match_json json, category
			end
		end

		context 'with subcategory' do
			it 'should create a transaction from a JSON representation' do
				json['subcategory'] = {'id' => subcategory.id}
				expect(Category).to receive(:find_or_new).with(json['subcategory'], category).and_return subcategory
				expect(SubTransaction.create_from_json json).to match_json json, subcategory
			end
		end
	end

	describe('::update_from_json') {}

	describe '#as_json' do
		let(:json) { subject.as_json }

		before :each do
			expect(subject.parent.account).to receive(:as_json).and_return 'parent account json'
		end

		context 'with category' do
			subject { create :sub_transaction }

			before :each do
				expect(subject.category).to receive(:as_json).and_return 'category json'
			end

			it 'should return a JSON representation' do
				expect(json).to include category: 'category json'
				expect(json).to include subcategory: nil
			end
		end

		context 'with subcategory' do
			subject { create :sub_transaction, category: FactoryGirl.create(:subcategory) }

			before :each do
				expect(subject.category.parent).to receive(:as_json).and_return 'category json'
				expect(subject.category).to receive(:as_json).and_return 'subcategory json'
			end

			it 'should return a JSON representation' do
				expect(json).to include category: 'category json'
				expect(json).to include subcategory: 'subcategory json'
			end
		end

		after :each do
			expect(json).to include primary_account: 'parent account json'
			expect(json).to include direction: 'outflow'
			expect(json).to include parent_id: subject.parent.id
		end
	end
end
