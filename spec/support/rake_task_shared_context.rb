# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rake'

# Shared context for rake tasks
::RSpec.shared_context 'rake task' do
	subject(:task) { ::Rake::Task[task_name] }

	before do
		::Rake::Task.define_task :environment unless ::Rake::Task.task_defined? :environment
		load ::Rails.root.join("lib/tasks/#{task_name.tr ':', '_'}.rake") unless ::Rake::Task.task_defined? task_name
		task.reenable
	end
end

::RSpec.configure do |config|
	config.include_context 'rake task', type: :task
end
