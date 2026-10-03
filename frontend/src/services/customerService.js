import api from './api';

export const customerService = {
  // GET /api/customers (Admin: all customers)
  getAllCustomers: async () => {
    const response = await api.get('/customers');
    return response.data;
  },

  // GET /api/customers/:customerId (Admin: customer details + rentals)
  getCustomerById: async (customerId) => {
    const response = await api.get(`/customers/${encodeURIComponent(customerId)}`);
    return response.data;
  },

  // GET /api/customers/me/rentals (Customer: rental history with vehicle and payment info)
  getMyRentals: async () => {
    const response = await api.get('/customers/me/rentals');
    return response.data;
  },
};

export default customerService;
