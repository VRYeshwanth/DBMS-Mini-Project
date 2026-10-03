import api from './api';

export const maintenanceService = {
  // GET /api/maintenance (Admin: all maintenance records)
  getAllMaintenance: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },

  // GET /api/maintenance/:maintenanceId (Admin: specific maintenance record)
  getMaintenanceById: async (maintenanceId) => {
    const response = await api.get(`/maintenance/${encodeURIComponent(maintenanceId)}`);
    return response.data;
  },

  // POST /api/maintenance (Admin: create maintenance record)
  createMaintenance: async (maintenanceData) => {
    const response = await api.post('/maintenance', maintenanceData);
    return response.data;
  },

  // PUT /api/maintenance/:maintenanceId (Admin: update maintenance record)
  updateMaintenance: async (maintenanceId, maintenanceData) => {
    const response = await api.put(`/maintenance/${encodeURIComponent(maintenanceId)}`, maintenanceData);
    return response.data;
  },

  // DELETE /api/maintenance/:maintenanceId (Admin: delete maintenance record)
  deleteMaintenance: async (maintenanceId) => {
    const response = await api.delete(`/maintenance/${encodeURIComponent(maintenanceId)}`);
    return response.data;
  },
};

export default maintenanceService;
