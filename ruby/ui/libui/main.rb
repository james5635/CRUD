require 'glimmer-dsl-libui'
require 'httparty'
require 'ostruct'

class MotorcycleApp
  include Glimmer

  API_URL = 'http://localhost:3000/motorcycles'

  attr_accessor :motorcycles, :selected_motorcycle

  def initialize
    @motorcycles = []
    fetch_motorcycles
  end

  def fetch_motorcycles
    response = HTTParty.get(API_URL)
    if response.success?
      self.motorcycles = response.parsed_response.map { |m| OpenStruct.new(m) }
    else
      error_dialog('Failed to fetch motorcycles.')
    end
  end

  def create_motorcycle(data)
    response = HTTParty.post(API_URL, body: { motorcycle: data })
    if response.success?
      fetch_motorcycles
    else
      error_dialog("Failed to create motorcycle: #{response.body}")
    end
  end

  def update_motorcycle(data)
    response = HTTParty.put("#{API_URL}/#{selected_motorcycle['id']}", body: { motorcycle: data })
    if response.success?
      fetch_motorcycles
    else
      error_dialog("Failed to update motorcycle: #{response.body}")
    end
  end

  def delete_motorcycle
    return unless selected_motorcycle
    response = HTTParty.delete("#{API_URL}/#{selected_motorcycle['id']}")
    if response.success?
      self.selected_motorcycle = nil
      fetch_motorcycles
    else
      error_dialog('Failed to delete motorcycle.')
    end
  end

  def error_dialog(message)
    dialog('Error') {
      label(message)
    }.show
  end

  def launch
    window('Motorcycle CRUD', 600, 400) {
      margined true

      vertical_box {
        horizontal_box {
          button('Refresh') { on_clicked { fetch_motorcycles } }
          button('New') { on_clicked { motorcycle_dialog.show } }
          button('Edit') {
            enabled <= [self, :selected_motorcycle, on_read: ->(val) { !val.nil? }]
            on_clicked { motorcycle_dialog(selected_motorcycle).show }
          }
          button('Delete') {
            enabled <= [self, :selected_motorcycle, on_read: ->(val) { !val.nil? }]
            on_clicked {
              msg_box('Confirm Deletion', "Delete #{selected_motorcycle['brand']} #{selected_motorcycle['model']}?") {
                delete_motorcycle
              }
            }
          }
        }

        table {
          text_column('Brand')
          text_column('Model')
          text_column('Year')

          cell_rows <= [self, :motorcycles]
          
          on_selection_changed do |t|
            self.selected_motorcycle = @motorcycles[t.selection] if t.selection && t.selection >= 0
          end
        }
      }
    }.show
  end

  def motorcycle_dialog(motorcycle = nil)
    data = motorcycle ? motorcycle.to_h : { 'brand' => '', 'model' => '', 'year' => '' }
    dialog = window(motorcycle ? 'Edit Motorcycle' : 'New Motorcycle', 300, 150) {
      margined true
      vertical_box {
        form {
          entry {
            label 'Brand'
            text <=> [data, 'brand']
          }
          entry {
            label 'Model'
            text <=> [data, 'model']
          }
          entry {
            label 'Year'
            text <=> [data, 'year']
          }
        }
        button('Save') {
          on_clicked do
            if motorcycle
              update_motorcycle(data)
            else
              create_motorcycle(data)
            end
            dialog.destroy
          end
        }
      }
      on_closing do
        dialog.destroy
      end
    }
    dialog
  end
end

MotorcycleApp.new.launch