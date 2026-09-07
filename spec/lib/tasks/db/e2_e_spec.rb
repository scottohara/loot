# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'tasks/db_e2e'

::RSpec.describe ::DB::E2E do
	describe '::create_test_data' do
		# Use a fresh application for each example so that each has its own registry of tasks.
		# Restoring the original effectively clears any registered tasks just for that example.
		around do |example|
			rake_application = ::Rake.application
			::Rake.application = ::Rake::Application.new
			example.run
		ensure
			::Rake.application = rake_application
		end

		before { ::Rake::Task.define_task :environment }

		it 'should define a new rake task' do
			described_class.create_test_data :example
			expect(::Rake::Task.task_defined? 'db:e2e:example').to be true
		end

		it 'should handle a block with no arguments' do
			expected = ''

			described_class.create_test_data :example do
				expected = nil
			end

			::Rake::Task['db:e2e:example'].invoke

			expect(expected).to be_nil
		end

		it 'should handle a block with one argument' do
			expected = nil

			described_class.create_test_data :example do |arg|
				expected = arg
			end

			::Rake::Task['db:e2e:example'].invoke 'arg1'

			expect(expected).to eq 'arg1'
		end

		it 'should handle a block with many arguments' do
			expected = nil

			described_class.create_test_data :example do |*args|
				expected = *args
			end

			::Rake::Task['db:e2e:example'].invoke 'arg1,arg2'

			expect(expected).to eq %w[arg1 arg2]
		end
	end
end
