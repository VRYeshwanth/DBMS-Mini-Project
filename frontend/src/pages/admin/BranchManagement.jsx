import React, { useState, useEffect } from 'react';
import branchService from '../../services/branchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { formatPlateNumber } from '../../utils/formatters';
import {
  Building2,
  Plus,
  Edit2,
  Eye,
  MapPin,
  Car,
  RefreshCw,
  Search
} from 'lucide-react';

export const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Branch Details Modal (with vehicles)
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingBranchDetails, setLoadingBranchDetails] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await branchService.getAllBranches();
      if (res && res.data) {
        setBranches(res.data);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(err?.response?.data?.message || 'Failed to fetch branch offices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setFormData({ name: '', address: '' });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBranch(b);
    setFormData({ name: b.name, address: b.address });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleViewBranch = async (branchId) => {
    setLoadingBranchDetails(true);
    try {
      const res = await branchService.getBranchById(branchId);
      if (res && res.data) {
        setSelectedBranch(res.data);
      }
    } catch (err) {
      console.error('Error loading branch details:', err);
    } finally {
      setLoadingBranchDetails(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim() || !formData.address.trim()) {
      setModalError('Both branch name and address are required.');
      return;
    }

    setModalSubmitting(true);
    try {
      if (editingBranch) {
        // PUT /api/branches/:branchId
        await branchService.updateBranch(editingBranch.branch_id, {
          name: formData.name.trim(),
          address: formData.address.trim(),
        });
        setSuccessMsg(`Branch ${editingBranch.branch_id} updated successfully.`);
      } else {
        // POST /api/branches
        await branchService.createBranch({
          name: formData.name.trim(),
          address: formData.address.trim(),
        });
        setSuccessMsg(`New branch registered successfully.`);
      }

      setIsModalOpen(false);
      fetchBranches();
    } catch (err) {
      console.error('Branch form error:', err);
      setModalError(err?.response?.data?.message || 'Failed to save branch.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const filteredBranches = branches.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.branch_id.toLowerCase().includes(term) ||
      b.name.toLowerCase().includes(term) ||
      b.address.toLowerCase().includes(term)
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
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Branch Locations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Manage regional depot hubs, service garages, and fleet distribution centers
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchBranches}
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
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Search Bar */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 38 }}
            placeholder="Search branches by ID, name, or street address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
        </div>
      </div>

      {/* Grid of Branch Cards */}
      {loading ? (
        <LoadingSpinner message="Querying branches from database..." />
      ) : filteredBranches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Branches Found"
          description={
            branches.length === 0
              ? 'No branch locations currently exist in the BRANCH table.'
              : 'No branches match your search filter.'
          }
          action={
            <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
              Create First Branch
            </button>
          }
        />
      ) : (
        <div className="grid-3">
          {filteredBranches.map((branch) => (
            <div key={branch.branch_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: '#8A6700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={24} />
                </div>
                <code style={{ fontWeight: 700, fontSize: 13, backgroundColor: '#FAF9F2', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                  {branch.branch_id}
                </code>
              </div>

              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{branch.name}</h3>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                <MapPin size={16} color="#999" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{branch.address}</span>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <button
                  onClick={() => handleViewBranch(branch.branch_id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                >
                  <Eye size={14} /> Vehicles
                </button>
                <button
                  onClick={() => handleOpenEditModal(branch)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                >
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? `Edit Branch: ${editingBranch.branch_id}` : 'Register New Branch'}
      >
        {modalError && <Alert type="danger" message={modalError} />}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="branch_name">
              Branch Name <span className="required">*</span>
            </label>
            <input
              id="branch_name"
              type="text"
              className="form-control"
              placeholder="e.g. Bangalore Airport Depot"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="branch_address">
              Address <span className="required">*</span>
            </label>
            <textarea
              id="branch_address"
              className="form-control"
              rows={3}
              placeholder="Street address, City, State"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
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
              {modalSubmitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Branch Assigned Vehicles Modal */}
      <Modal
        isOpen={!!selectedBranch}
        onClose={() => setSelectedBranch(null)}
        title={`Branch Fleet: ${selectedBranch?.name || ''}`}
        size="lg"
      >
        {selectedBranch && (
          <div>
            <div style={{
              backgroundColor: 'var(--bg-muted)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: 20,
              fontSize: 13
            }}>
              <div><strong>Branch ID:</strong> {selectedBranch.branch_id}</div>
              <div style={{ marginTop: 4 }}><strong>Address:</strong> {selectedBranch.address}</div>
            </div>

            <h4 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Car size={18} color="#D9A900" />
              Vehicles Assigned to this Branch ({selectedBranch.vehicles?.length || 0})
            </h4>

            {(!selectedBranch.vehicles || selectedBranch.vehicles.length === 0) ? (
              <div style={{ textAlign: 'center', padding: 24, backgroundColor: '#FAF9F2', borderRadius: 'var(--radius-md)', color: '#888', fontSize: 13 }}>
                No vehicles are currently assigned to this branch location.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Make & Model</th>
                      <th>Category</th>
                      <th>Year</th>
                      <th>Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBranch.vehicles.map((v) => (
                      <tr key={v.plate_number}>
                        <td><code>{formatPlateNumber(v.plate_number)}</code></td>
                        <td><strong>{v.make} {v.model}</strong></td>
                        <td><span className="badge badge-yellow">{v.type}</span></td>
                        <td>{v.year}</td>
                        <td>{v.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BranchManagement;
