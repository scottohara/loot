def progress(action, count, type)
	reset_line = "\r\e[0K"
	print "#{reset_line}#{action} #{ActionController::Base.helpers.pluralize(count, type)}"
end

namespace :db do
	desc "Purge transactions earlier than [:cutoff_date] (rake db:shrink[2001-12-31])"
	task :shrink, [:cutoff_date] => :environment  do |t, args|
		abort "You must provide a :cutoff_date as YYYY-MM-DD (eg. rake db:shrink[2001-12-31])" if args[:cutoff_date].nil?

		# Turn off verbose logging
		ActiveRecord::Base.logger.level = 1

		# Get the transaction headers
		transaction_headers = TransactionHeader.where(transaction_date: Date.new(0)...Date.parse(args[:cutoff_date]))

		# Early exit if no transactions found
		abort "No transactions earlier than #{args[:cutoff_date]} found" if transaction_headers.size.eql? 0

		# Sanity check
		print "WARNING: You are about to purge #{ActionController::Base.helpers.pluralize(transaction_headers.size, 'transaction header')} earlier than #{args[:cutoff_date]}. Type 'purge' and hit enter to proceed: "
		abort "Shrink aborted" unless STDIN.gets.chomp.downcase.eql? 'purge'

		transaction_headers.each_with_index do |header, index|
			# Destroy the transaction
			header.trx.as_subclass.destroy unless header.trx.nil? || %w(Subtransfer Sub).include?(header.trx.transaction_type)

			index += 1
			progress "Deleted", index, "transaction"
		end

		puts
		puts "Shrink done"
	end
end

