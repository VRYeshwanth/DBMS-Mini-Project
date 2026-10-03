import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import branchService from '../../services/branchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatPlateNumber } from '../../utils/formatters';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  Palette
} from 'lucide-react';

export const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null); // null if adding
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    type: 'SUV',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    branch_id: '',
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
      const [vehRes, branchRes] = await Promise.all([
        vehicleService.getAllVehicles(),
        branchService.getAllBranches(),
      ]);

      if (vehRes && vehRes.data) {
        setVehicles(vehRes.data);
      }
      if (branchRes && branchRes.data) {
        setBranches(branchRes.data);
      }
    } catch (err) {
      console.error('Error fetching vehicle management data:', err);
      setError(err?.response?.data?.message || 'Failed to fetch vehicles from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      plate_number: '',
      make: '',
      type: 'SUV',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      branch_id: branches.length > 0 ? branches[0].branch_id : '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (veh) => {
    setEditingVehicle(veh);
    setFormData({
      plate_number: veh.plate_number,
      make: veh.make,
      type: veh.type,
      model: veh.model,
      year: veh.year,
      color: veh.color,
      branch_id: veh.branch_id,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (
      !formData.make ||
      !formData.model ||
      !formData.type ||
      !formData.year ||
      !formData.color ||
      !formData.branch_id
    ) {
      setModalError('All fields are required.');
      return;
    }

    if (!editingVehicle && !formData.plate_number) {
      setModalError('License plate number is required.');
      return;
    }

    setModalSubmitting(true);
    try {
      if (editingVehicle) {
        // PUT /api/vehicles/:plateNumber
        await vehicleService.updateVehicle(editingVehicle.plate_number, {
          make: formData.make,
          type: formData.type,
          model: formData.model,
          year: Number(formData.year),
          color: formData.color,
          branch_id: formData.branch_id,
        });
        setSuccessMsg(`Vehicle ${editingVehicle.plate_number} updated successfully.`);
      } else {
        // POST /api/vehicles
        await vehicleService.createVehicle({
          plate_number: formData.plate_number.toUpperCase().trim(),
          make: formData.make,
          type: formData.type,
          model: formData.model,
          year: Number(formData.year),
          color: formData.color,
          branch_id: formData.branch_id,
        });
        setSuccessMsg(`Vehicle ${formData.plate_number} added to fleet successfully.`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Vehicle form error:', err);
      setModalError(err?.response?.data?.message || 'Operation failed. Check backend validation.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await vehicleService.deleteVehicle(deleteTarget.plate_number);
      setSuccessMsg(`Vehicle ${deleteTarget.plate_number} deleted successfully.`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error('Delete vehicle error:', err);
      setError(
        err?.response?.data?.message ||
        'Cannot delete vehicle. Check if it is referenced in active rentals or maintenance records.'
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.plate_number.toLowerCase().includes(term) ||
      v.make.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      v.type.toLowerCase().includes(term) ||
      v.color.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Vehicle Fleet Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Register new vehicles, update vehicle specifications, and maintain branch allocations
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
            <Plus size={16} /> Add Vehicle
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
            placeholder="Search vehicles by plate number, make, model, category, or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading fleet records from database..." />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Vehicles Found"
          description={
            vehicles.length === 0
              ? 'No vehicles currently registered in the database.'
              : 'No vehicles match your search filter.'
          }
          action={
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              Add First Vehicle
            </button>
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>Make & Model</th>
                <th>Category</th>
                <th>Year</th>
                <th>Color</th>
                <th>Branch ID</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((veh) => {
                const branchObj = branches.find((b) => b.branch_id === veh.branch_id);

                return (
                  <tr key={veh.plate_number}>
                    <td>
                      <code style={{ fontSize: 13, fontWeight: 700 }}>
                        {formatPlateNumber(veh.plate_number)}
                      </code>
                    </td>
                    <td>
                      <strong>{veh.make}</strong> {veh.model}
                    </td>
                    <td>
                      <span className="badge badge-yellow">{veh.type}</span>
                    </td>
                    <td>{veh.year}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: veh.color.toLowerCase() === 'white' ? '#EEE' : veh.color.toLowerCase(),
                          border: '1px solid #CCC',
                          display: 'inline-block'
                        }} />
                        {veh.color}
                      </span>
                    </td>
                    <td>
                      <span title={branchObj?.name || veh.branch_id}>
                        {branchObj?.name || veh.branch_id}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditModal(veh)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px' }}
                          title="Edit Vehicle"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(veh)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 10px' }}
                          title="Delete Vehicle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? `Edit Vehicle: ${editingVehicle.plate_number}` : 'Add New Vehicle to Fleet'}
        size="default"
      >
        {modalError && <Alert type="danger" message={modalError} />}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="plate_number">
              License Plate Number <span className="required">*</span>
            </label>
            <input
              id="plate_number"
              type="text"
              className="form-control"
              placeholder="e.g. KA01AB1234"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              disabled={!!editingVehicle}
              required
            />
            {editingVehicle && (
              <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2, display: 'block' }}>
                Primary key plate numbers cannot be modified after registration.
              </span>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="make">
                Make / Manufacturer <span className="required">*</span>
              </label>
              <input
                id="make"
                type="text"
                className="form-control"
                placeholder="e.g. Toyota"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="model">
                Model <span className="required">*</span>
              </label>
              <input
                id="model"
                type="text"
                className="form-control"
                placeholder="e.g. Fortuner"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="type">
                Category <span className="required">*</span>
              </label>
              <select
                id="type"
                className="form-control"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Luxury">Luxury</option>
                <option value="Van">Van</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="year">
                Manufacturing Year <span className="required">*</span>
              </label>
              <input
                id="year"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                className="form-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="color">
                Color <span className="required">*</span>
              </label>
              <input
                id="color"
                type="text"
                className="form-control"
                placeholder="e.g. White, Black, Blue"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="branch_id">
                Assigned Branch <span className="required">*</span>
              </label>
              <select
                id="branch_id"
                className="form-control"
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                required
              >
                <option value="">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.name} ({b.branch_id})
                  </option>
                ))}
              </select>
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
              {modalSubmitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteTarget?.plate_number} (${deleteTarget?.make} ${deleteTarget?.model})? This action cannot be undone.`}
        confirmText="Confirm Delete"
        loading={deleting}
      />
    </div>
  );
};

export default VehicleManagement;
