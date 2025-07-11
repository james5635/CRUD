class MotorcyclesController < ApplicationController
  before_action :set_motorcycle, only: %i[ show update destroy ]

  # GET /motorcycles
  def index
    @motorcycles = Motorcycle.all

    render json: @motorcycles
  end

  # GET /motorcycles/1
  def show
    render json: @motorcycle
  end

  # POST /motorcycles
  def create
    @motorcycle = Motorcycle.new(motorcycle_params)

    if @motorcycle.save
      render json: @motorcycle, status: :created, location: @motorcycle
    else
      render json: @motorcycle.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /motorcycles/1
  def update
    if @motorcycle.update(motorcycle_params)
      render json: @motorcycle
    else
      render json: @motorcycle.errors, status: :unprocessable_entity
    end
  end

  # DELETE /motorcycles/1
  def destroy
    @motorcycle.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_motorcycle
      @motorcycle = Motorcycle.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def motorcycle_params
      params.expect(motorcycle: [ :brand, :model, :year ])
    end
end
