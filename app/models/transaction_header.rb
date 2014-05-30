class TransactionHeader < ActiveRecord::Base
	belongs_to :trx, :foreign_key => 'transaction_id', :class_name => 'Transaction'
	belongs_to :schedule, :dependent => :destroy, :autosave => true
	self.primary_key = "transaction_id"

	def validate_transaction_date_or_schedule_presence
		errors[:base] << "Either transaction date or schedule can't be blank" if transaction_date.blank? && schedule.blank?
	end

	def validate_transaction_date_or_schedule_absence
		errors[:base] << "Either transaction date or schedule must be blank" unless transaction_date.blank? || schedule.blank?
	end

	def update_from_json(json)
		if json['transaction_date'].nil?
			self.transaction_date = nil
			self.build_schedule if self.schedule.nil?
			self.schedule.assign_attributes :next_due_date => json['next_due_date'], :frequency => json['frequency'], :estimate => !!json['estimate'], :auto_enter => !!json['auto_enter']
		else
			self.transaction_date = json['transaction_date']
			self.schedule.destroy unless self.schedule.nil?
		end

		self
	end
end
