import api from './api';

export const rentalService = {
  // POST /api/rentals (Customer: create rental)
  createRental: async (rentalData) => {
    const response = await api.post('/rentals', rentalData);
    return response.data;
  },

  // GET /api/rentals (Admin: all rentals, Customer: own rentals)
  getAllRentals: async () => {
    const response = await api.get('/rentals');
    return response.data;
  },

  // GET /api/rentals/:rentalId (Customer / Admin: rental details)
  getRentalById: async (rentalId) => {
    const response = await api.get(`/rentals/${encodeURIComponent(rentalId)}`);
    return response.data;
  },
};

export default rentalService;
