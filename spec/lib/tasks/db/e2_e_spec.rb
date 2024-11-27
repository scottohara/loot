# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'rake'
require 'tasks/db_e2e'

::RSpec.describe ::DB::E2E do
	describe '::create_test_data' do
		before do
			::Rake::Task.define_task(:environment) unless ::Rake::Task.task_defined? :environment
		end

		after do
			::Rake::Task.clear
		end

		it 'should define a new rake task' do
			described_class.create_test_data(:example)
			expect(::Rake::Task.task_defined? 'db:e2e:example').to be true
		end

		it 'should handle a block with no arguments' do
			expected = ''

			described_class.create_test_data(:example) do
				expected = nil
			end

			::Rake::Task['db:e2e:example'].invoke

			expect(expected).to be_nil
		end

		it 'should handle a block with one argument' do
			expected = nil

			described_class.create_test_data(:example) do |arg|
				expected = arg
			end

			::Rake::Task['db:e2e:example'].invoke 'arg1'

			expect(expected).to eq 'arg1'
		end

		it 'should handle a block with many arguments' do
			expected = nil

			described_class.create_test_data(:example) do |*args|
				expected = *args
			end

			::Rake::Task['db:e2e:example'].invoke 'arg1,arg2'

			expect(expected).to eq %w[arg1 arg2]
		end
	end
end
