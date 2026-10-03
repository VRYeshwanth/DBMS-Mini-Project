import api from './api';

export const branchService = {
  // GET /api/branches
  getAllBranches: async () => {
    const response = await api.get('/branches');
    return response.data;
  },

  // GET /api/branches/:branchId
  getBranchById: async (branchId) => {
    const response = await api.get(`/branches/${encodeURIComponent(branchId)}`);
    return response.data;
  },

  // POST /api/branches
  createBranch: async (branchData) => {
    const response = await api.post('/branches', branchData);
    return response.data;
  },

  // PUT /api/branches/:branchId
  updateBranch: async (branchId, branchData) => {
    const response = await api.put(`/branches/${encodeURIComponent(branchId)}`, branchData);
    return response.data;
  },
};

export default branchService;
