unless ENV[:RACK_ENV.to_s].eql?("production")
	require 'heroku-api'
	require 'git'
	require 'logger'
end

namespace :deploy do
	# Assumes two git remotes, named staging and production
	[:staging, :production].each do |remote|
		desc "Deploy to #{remote}"
		task remote do
			logger = Logger.new(STDOUT)
			logger.level = Logger::WARN
			logger.formatter = proc do |severity, datetime, progname, msg|
				"#{msg}\n"
			end

			# Get a reference to the git repo
			git = Git.open Rails.root, :log => logger

			# Get a reference to the named remote
			git_remote = git.remote remote

			# Extract the name of the application from the remote URL
			# (Assumes heroku, so the URL will be git@heroku.com:APP_NAME.git)
			app_name = git_remote.url.match(/^git@heroku\.com\:(.*)\.git$/)[1]

			# Get the most recent tag
			# (Would be great if ruby-git supported git describe, so that we don't need this system call)
			latest_version = `git describe --abbrev=0`.chomp

			# Connect to the heroku API
			# (Assumes that ENV['HEROKU_API_KEY'] is defined)
			heroku = Heroku::API.new

			# Get the APP_VERSION config var for the application
			previous_version = heroku.get_config_vars(app_name).body["APP_VERSION"]

			# Abort if the version being pushed is already deployed
			raise "#{latest_version} is already deployed to #{remote}. Please create a new tag for the new version." if latest_version.eql? previous_version
			
			print "Deploy #{latest_version} to #{remote} (#{app_name}), replacing #{previous_version}? (y)es or (n)o [enter = no]: "
			raise "Deployment aborted" unless STDIN.gets.chomp.downcase.eql? 'y'

			logger.level = Logger::DEBUG

			# Deploy the latest version to the specified remote
			git.push remote, "#{latest_version}^{}:master"
			
			# Update the APP_VERSION config var
			heroku.put_config_vars app_name, "APP_VERSION" => latest_version

			puts "Deployment done"
		end
	end
end

