import api from './api';

export const paymentService = {
  // POST /api/payments (Record payment for rental)
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // GET /api/payments (Admin: all, Customer: own)
  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // GET /api/payments/:paymentId (Customer / Admin)
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${encodeURIComponent(paymentId)}`);
    return response.data;
  },
};

export default paymentService;
