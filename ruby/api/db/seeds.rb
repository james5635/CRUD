# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
Motorcycle.create!([
  {
    brand: "Honda",
    model: "CBR600RR",
    year: 2023
  },
  {
    brand: "Yamaha",
    model: "YZF-R1",
    year: 2022
  },
  {
    brand: "Ducati",
    model: "Panigale V4",
    year: 2023
  }
])