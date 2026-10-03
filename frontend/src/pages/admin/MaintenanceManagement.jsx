import React, { useState, useEffect } from 'react';
import maintenanceService from '../../services/maintenanceService';
import vehicleService from '../../services/vehicleService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, formatPlateNumber } from '../../utils/formatters';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Car,
  AlertCircle
} from 'lucide-react';

export const MaintenanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // null if adding
  const [formData, setFormData] = useState({
    plate_number: '',
    maintenance_status: 'Active',
    maintenance_amt: '0',
    maintenance_type: '',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [maintRes, vehRes] = await Promise.all([
        maintenanceService.getAllMaintenance(),
        vehicleService.getAllVehicles(),
      ]);

      if (maintRes && maintRes.data) {
        setRecords(maintRes.data);
      }
      if (vehRes && vehRes.data) {
        setVehicles(vehRes.data);
      }
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
      setError(err?.response?.data?.message || 'Failed to fetch maintenance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      plate_number: vehicles.length > 0 ? vehicles[0].plate_number : '',
      maintenance_status: 'Active',
      maintenance_amt: '1500',
      maintenance_type: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecord(rec);
    setFormData({
      plate_number: rec.plate_number,
      maintenance_status: rec.maintenance_status,
      maintenance_amt: String(rec.maintenance_amt),
      maintenance_type: rec.maintenance_type,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.maintenance_type.trim()) {
      setModalError('Maintenance description/type is required.');
      return;
    }

    if (formData.maintenance_type.length > 50) {
      setModalError('Maintenance type cannot exceed 50 characters.');
      return;
    }

    const numAmt = Number(formData.maintenance_amt);
    if (isNaN(numAmt) || numAmt < 0) {
      setModalError('Amount must be a non-negative number.');
      return;
    }

    setModalSubmitting(true);
    try {
      if (editingRecord) {
        // PUT /api/maintenance/:maintenanceId
        await maintenanceService.updateMaintenance(editingRecord.maintenance_id, {
          maintenance_status: formData.maintenance_status,
          maintenance_amt: numAmt,
          maintenance_type: formData.maintenance_type.trim(),
        });
        setSuccessMsg(`Maintenance record ${editingRecord.maintenance_id} updated.`);
      } else {
        // POST /api/maintenance
        await maintenanceService.createMaintenance({
          plate_number: formData.plate_number,
          maintenance_status: formData.maintenance_status,
          maintenance_amt: numAmt,
          maintenance_type: formData.maintenance_type.trim(),
        });
        setSuccessMsg(`Maintenance job logged for vehicle ${formData.plate_number}.`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Maintenance form error:', err);
      // Backend error e.g. "Vehicle is currently rented and cannot be sent for maintenance"
      setModalError(err?.response?.data?.message || 'Operation failed.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await maintenanceService.deleteMaintenance(deleteTarget.maintenance_id);
      setSuccessMsg(`Maintenance record ${deleteTarget.maintenance_id} deleted.`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Delete maintenance error:', err);
      setError(err?.response?.data?.message || 'Failed to delete maintenance record.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.maintenance_id.toLowerCase().includes(term) ||
      r.plate_number.toLowerCase().includes(term) ||
      r.maintenance_type.toLowerCase().includes(term) ||
      (r.make && r.make.toLowerCase().includes(term)) ||
      (r.model && r.model.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Vehicle Maintenance Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Schedule inspections, record service costs, and prevent scheduling conflicts on rented units
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Log Maintenance
          </button>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Search Input */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 38 }}
            placeholder="Search by maintenance ID, vehicle plate, type, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading maintenance records..." />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Maintenance Records Found"
          description={
            records.length === 0
              ? 'No service logs exist in the MAINTENANCE table.'
              : 'No maintenance records match your search filter.'
          }
          action={
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              Log First Maintenance Record
            </button>
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Vehicle</th>
                <th>Maintenance Type</th>
                <th>Logged Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.maintenance_id}>
                  <td>
                    <code>{rec.maintenance_id}</code>
                  </td>
                  <td>
                    <strong>{rec.make} {rec.model}</strong>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {formatPlateNumber(rec.plate_number)}
                    </div>
                  </td>
                  <td>
                    <strong>{rec.maintenance_type}</strong>
                  </td>
                  <td>
                    {formatDate(rec.maintenance_date)}
                  </td>
                  <td>
                    <strong style={{ color: Number(rec.maintenance_amt) > 0 ? '#B91C1C' : '#666' }}>
                      {formatCurrency(rec.maintenance_amt)}
                    </strong>
                  </td>
                  <td>
                    <StatusBadge status={rec.maintenance_status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEditModal(rec)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Edit Record"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(rec)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Maintenance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? `Update Maintenance: ${editingRecord.maintenance_id}` : 'Log Vehicle Maintenance'}
      >
        {modalError && <Alert type="danger" message={modalError} />}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="plate_number">
              Vehicle <span className="required">*</span>
            </label>
            <select
              id="plate_number"
              className="form-control"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              disabled={!!editingRecord}
              required
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.plate_number} value={v.plate_number}>
                  {v.make} {v.model} ({v.plate_number})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="maintenance_type">
              Maintenance Type / Description <span className="required">*</span>
            </label>
            <input
              id="maintenance_type"
              type="text"
              className="form-control"
              placeholder="e.g. Engine Servicing, Brake Pad Replacement, Oil Change"
              maxLength={50}
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
              required
            />
            <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2, display: 'block' }}>
              Free-text field (maximum 50 characters).
            </span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="maintenance_status">
                Status <span className="required">*</span>
              </label>
              <select
                id="maintenance_status"
                className="form-control"
                value={formData.maintenance_status}
                onChange={(e) => setFormData({ ...formData, maintenance_status: e.target.value })}
                required
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="maintenance_amt">
                Servicing Cost (₹) <span className="required">*</span>
              </label>
              <input
                id="maintenance_amt"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={formData.maintenance_amt}
                onChange={(e) => setFormData({ ...formData, maintenance_amt: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={modalSubmitting}
            >
              {modalSubmitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Maintenance Record"
        message={`Are you sure you want to delete maintenance record ${deleteTarget?.maintenance_id} for ${deleteTarget?.plate_number}?`}
        confirmText="Confirm Delete"
        loading={deleting}
      />
    </div>
  );
};

export default MaintenanceManagement;
