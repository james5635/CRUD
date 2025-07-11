require 'thor'
require 'httparty'
require 'json'

class MotorcycleCLI < Thor
  BASE_URL = 'http://localhost:3000'

  desc 'list', 'List all motorcycles'
  def list
    response = HTTParty.get("#{BASE_URL}/motorcycles")
    if response.success?
      motorcycles = JSON.parse(response.body)
      motorcycles.each do |motorcycle|
        puts "ID: #{motorcycle['id']}, Brand: #{motorcycle['brand']}, Model: #{motorcycle['model']}, Year: #{motorcycle['year']}"
      end
    else
      puts "Error: #{response.code} - #{response.message}"
    end
  end

  desc 'show ID', 'Show a specific motorcycle'
  def show(id)
    response = HTTParty.get("#{BASE_URL}/motorcycles/#{id}")
    if response.success?
      motorcycle = JSON.parse(response.body)
      puts "ID: #{motorcycle['id']}, Brand: #{motorcycle['brand']}, Model: #{motorcycle['model']}, Year: #{motorcycle['year']}"
    else
      puts "Error: #{response.code} - #{response.message}"
    end
  end

  desc 'create', 'Create a new motorcycle'
  option :brand, required: true, type: :string
  option :model, required: true, type: :string
  option :year, required: true, type: :numeric
  def create
    body = { motorcycle: { brand: options[:brand], model: options[:model], year: options[:year] } }
    response = HTTParty.post("#{BASE_URL}/motorcycles", body: body)
    if response.success?
      motorcycle = JSON.parse(response.body)
      puts "Created motorcycle:"
      puts "ID: #{motorcycle['id']}, Brand: #{motorcycle['brand']}, Model: #{motorcycle['model']}, Year: #{motorcycle['year']}"
    else
      puts "Error: #{response.code} - #{response.message}"
      puts response.body
    end
  end

  desc 'update ID', 'Update a motorcycle'
  option :brand, type: :string
  option :model, type: :string
  option :year, type: :numeric
  def update(id)
    if options.empty?
      puts "You must provide at least one attribute to update."
      puts "Usage: ./motorcycle update ID --brand <brand> --model <model> --year <year>"
      return
    end
    
    body = { motorcycle: {} }
    body[:motorcycle][:brand] = options[:brand] if options[:brand]
    body[:motorcycle][:model] = options[:model] if options[:model]
    body[:motorcycle][:year] = options[:year] if options[:year]

    response = HTTParty.patch("#{BASE_URL}/motorcycles/#{id}", body: body)
    if response.success?
      motorcycle = JSON.parse(response.body)
      puts "Updated motorcycle:"
      puts "ID: #{motorcycle['id']}, Brand: #{motorcycle['brand']}, Model: #{motorcycle['model']}, Year: #{motorcycle['year']}"
    else
      puts "Error: #{response.code} - #{response.message}"
      puts response.body
    end
  end

  desc 'delete ID', 'Delete a motorcycle'
  def delete(id)
    response = HTTParty.delete("#{BASE_URL}/motorcycles/#{id}")
    if response.success?
      puts "Motorcycle with ID #{id} deleted."
    else
      puts "Error: #{response.code} - #{response.message}"
    end
  end
end
