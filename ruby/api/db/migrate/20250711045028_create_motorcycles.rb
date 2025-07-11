class CreateMotorcycles < ActiveRecord::Migration[8.0]
  def change
    create_table :motorcycles do |t|
      t.string :brand
      t.string :model
      t.integer :year

      t.timestamps
    end
  end
end
