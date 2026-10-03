import api from './api';

export const dashboardService = {
  // GET /api/dashboard (Admin dashboard stats & aggregations)
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default dashboardService;
