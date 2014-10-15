RSpec.shared_examples Measurable do
	describe "::fortnights_since" do
		subject { described_class }

		it "should calculate the fortnights since a given date" do
			expect(subject.fortnights_since (Date.today - 14)).to eql 1
		end
		
		it "should round to down to the nearest fortnights since a given date" do
			expect(subject.fortnights_since (Date.today - 13)).to eql 0
			expect(subject.fortnights_since (Date.today - 15)).to eql 1
		end
	end

	describe "::months_since" do
		subject { described_class }

		it "should calculate the months since a given date" do
			expect(subject.months_since Date.today.advance(:months => -1)).to eql 1
		end
		
		it "should work across year boundaries" do
			expect(subject.months_since Date.today.advance(:years => -1)).to eql 12
		end

		it "should not include the current month if the day is less than the starting day" do
			expect(subject.months_since Date.today.advance(:months => -1, :days => 1)).to eql 0
			expect(subject.months_since Date.today.advance(:months => -1, :days => -1)).to eql 1
		end
	end

	describe "::quarters_since" do
		subject { described_class }

		it "should calculate the quarters since a given date" do
			expect(subject.quarters_since Date.today.advance(:months => -3)).to eql 1
		end
		
		it "should round to down to the nearest quarters since a given date" do
			expect(subject.quarters_since Date.today.advance(:months => -2)).to eql 0
			expect(subject.quarters_since Date.today.advance(:months => -4)).to eql 1
		end
	end

	describe "::years_since" do
		subject { described_class }

		it "should calculate the years since a given date" do
			expect(subject.years_since Date.today.advance(:years => -1)).to eql 1
		end
		
		it "should round to down to the nearest years since a given date" do
			expect(subject.years_since Date.today.advance(:years => -1, :days => 1)).to eql 0
			expect(subject.years_since Date.today.advance(:years => -1, :days => -1)).to eql 1
		end
	end

	describe "::periods_since" do
		subject { described_class }
		let(:date) { Date.new }

		it "should calculate the fortnights since a given date" do
			expect(subject).to receive(:fortnights_since).with date
			subject.periods_since "Fortnightly", date
		end

		it "should calculate the months since a given date" do
			expect(subject).to receive(:months_since).with date
			subject.periods_since "Monthly", date
		end

		it "should calculate the quaters since a given date" do
			expect(subject).to receive(:quarters_since).with date
			subject.periods_since "Quarterly", date
		end

		it "should calculate the years since a given date" do
			expect(subject).to receive(:years_since).with date
			subject.periods_since "Yearly", date
		end
	end
end
