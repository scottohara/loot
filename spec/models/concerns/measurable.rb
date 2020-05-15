# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

RSpec.shared_examples Measurable do
	describe '::weeks_since' do
		subject { described_class }

		it 'should calculate the weeks since a given date' do
			expect(subject.weeks_since(Time.zone.today - 7)).to be 1
		end

		it 'should round to down to the nearest weeks since a given date' do
			expect(subject.weeks_since(Time.zone.today - 6)).to be 0
			expect(subject.weeks_since(Time.zone.today - 8)).to be 1
		end
	end

	describe '::fortnights_since' do
		subject { described_class }

		it 'should calculate the fortnights since a given date' do
			expect(subject.fortnights_since(Time.zone.today - 14)).to be 1
		end

		it 'should round to down to the nearest fortnights since a given date' do
			expect(subject.fortnights_since(Time.zone.today - 13)).to be 0
			expect(subject.fortnights_since(Time.zone.today - 15)).to be 1
		end
	end

	describe '::months_since' do
		subject { described_class }

		it 'should calculate the months since a given date' do
			expect(subject.months_since Time.zone.today.advance(months: -1)).to be 1
		end

		it 'should work across year boundaries' do
			expect(subject.months_since Time.zone.today.advance(years: -1)).to be 12
		end

		it 'should not include the current month if the day is less than the starting day' do
			expect(subject.months_since Time.zone.today.advance(months: -1, days: 1)).to be 0
			expect(subject.months_since Time.zone.today.advance(months: -1, days: -1)).to be 1
		end
	end

	describe '::bimonths_since' do
		subject { described_class }

		it 'should calculate the bimonths since a given date' do
			expect(subject.bimonths_since Time.zone.today.advance(months: -2)).to be 1
		end

		it 'should round to down to the nearest bimonths since a given date' do
			expect(subject.bimonths_since Time.zone.today.advance(months: -1)).to be 0
			expect(subject.bimonths_since Time.zone.today.advance(months: -3)).to be 1
		end
	end

	describe '::quarters_since' do
		subject { described_class }

		it 'should calculate the quarters since a given date' do
			expect(subject.quarters_since Time.zone.today.advance(months: -3)).to be 1
		end

		it 'should round to down to the nearest quarters since a given date' do
			expect(subject.quarters_since Time.zone.today.advance(months: -2)).to be 0
			expect(subject.quarters_since Time.zone.today.advance(months: -4)).to be 1
		end
	end

	describe '::years_since' do
		subject { described_class }

		it 'should calculate the years since a given date' do
			expect(subject.years_since Time.zone.today.advance(years: -1)).to be 1
		end

		it 'should round to down to the nearest years since a given date' do
			expect(subject.years_since Time.zone.today.advance(years: -1, days: 1)).to be 0
			expect(subject.years_since Time.zone.today.advance(years: -1, days: -1)).to be 1
		end
	end

	describe '::periods_since' do
		subject { described_class }

		let(:date) { Date.new }

		it 'should calculate the weeks since a given date' do
			expect(subject).to receive(:weeks_since).with date
			subject.periods_since 'Weekly', date
		end

		it 'should calculate the fortnights since a given date' do
			expect(subject).to receive(:fortnights_since).with date
			subject.periods_since 'Fortnightly', date
		end

		it 'should calculate the months since a given date' do
			expect(subject).to receive(:months_since).with date
			subject.periods_since 'Monthly', date
		end

		it 'should calculate the bimonths since a given date' do
			expect(subject).to receive(:bimonths_since).with date
			subject.periods_since 'Bimonthly', date
		end

		it 'should calculate the quaters since a given date' do
			expect(subject).to receive(:quarters_since).with date
			subject.periods_since 'Quarterly', date
		end

		it 'should calculate the years since a given date' do
			expect(subject).to receive(:years_since).with date
			subject.periods_since 'Yearly', date
		end
	end

	describe '::advance_by' do
		subject { described_class }

		let(:date) { Time.zone.today }

		it 'should advance the given date by a week' do
			expect(subject.advance_by 'Weekly', date).to eq date.advance({weeks: 1})
		end

		it 'should advance the given date by a fortnight' do
			expect(subject.advance_by 'Fortnightly', date).to eq date.advance({weeks: 2})
		end

		it 'should advance the given date by a month' do
			expect(subject.advance_by 'Monthly', date).to eq date.advance({months: 1})
		end

		it 'should advance the given date by 2 months' do
			expect(subject.advance_by 'Bimonthly', date).to eq date.advance({months: 2})
		end

		it 'should advance the given date by a quarter' do
			expect(subject.advance_by 'Quarterly', date).to eq date.advance({months: 3})
		end

		it 'should advance the given date by a year' do
			expect(subject.advance_by 'Yearly', date).to eq date.advance({years: 1})
		end
	end
end
