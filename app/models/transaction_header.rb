class TransactionHeader < ActiveRecord::Base
	belongs_to :trx, foreign_key: 'transaction_id', class_name: 'Transaction'
	belongs_to :schedule, dependent: :destroy, autosave: true
	self.primary_key = "transaction_id"

	def validate_transaction_date_or_schedule_presence
		errors[:base] << "Either transaction date or schedule can't be blank" if transaction_date.blank? && schedule.blank?
	end

	def validate_transaction_date_or_schedule_absence
		errors[:base] << "Either transaction date or schedule must be blank" unless transaction_date.blank? || schedule.blank?
	end

	def update_from_json(json)
		self.transaction_date = json['transaction_date']

		if json['transaction_date'].nil?
			schedule = self.schedule || self.build_schedule
			schedule.assign_attributes next_due_date: json['next_due_date'], frequency: json['frequency'], estimate: !!json['estimate'], auto_enter: !!json['auto_enter']
		else
			self.schedule.destroy unless self.schedule.nil?
		end

		self
	end

	def as_json(options={})
		(self.schedule.present? && self.schedule.as_json || {}).merge({
			transaction_date: self.transaction_date
		})
	end
end
