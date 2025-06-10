FactoryBot.define do
  factory :todo do
    title { "Sample Todo" }
    is_completed { false }

    trait :completed do
      is_completed { true }
    end

    trait :with_long_title do
      title { "A" * 100 }
    end
  end
end