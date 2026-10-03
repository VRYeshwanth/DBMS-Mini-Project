import api from './api';

export const vehicleService = {
  // GET /api/vehicles (Admin view: all vehicles)
  getAllVehicles: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  // GET /api/vehicles/available (Customer / Public: available vehicles)
  getAvailableVehicles: async () => {
    const response = await api.get('/vehicles/available');
    return response.data;
  },

  // GET /api/vehicles/:plateNumber (Public / Detail)
  getVehicleByPlateNumber: async (plateNumber) => {
    const response = await api.get(`/vehicles/${encodeURIComponent(plateNumber)}`);
    return response.data;
  },

  // POST /api/vehicles (Admin: Create vehicle)
  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  // PUT /api/vehicles/:plateNumber (Admin: Update vehicle)
  updateVehicle: async (plateNumber, vehicleData) => {
    const response = await api.put(`/vehicles/${encodeURIComponent(plateNumber)}`, vehicleData);
    return response.data;
  },

  // DELETE /api/vehicles/:plateNumber (Admin: Delete vehicle)
  deleteVehicle: async (plateNumber) => {
    const response = await api.delete(`/vehicles/${encodeURIComponent(plateNumber)}`);
    return response.data;
  },
};

export default vehicleService;
