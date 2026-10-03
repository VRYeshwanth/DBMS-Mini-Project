import React, { useState, useEffect } from 'react';
import rentalService from '../../services/rentalService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatDateTime, formatPlateNumber } from '../../utils/formatters';
import {
  KeyRound,
  Search,
  RefreshCw,
  Eye,
  Car,
  Calendar,
  MapPin,
  User,
  Phone
} from 'lucide-react';

export const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Details Modal
  const [selectedRental, setSelectedRental] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchRentals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalService.getAllRentals();
      if (res && res.data) {
        setRentals(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin rentals:', err);
      setError(err?.response?.data?.message || 'Failed to fetch rentals from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleViewDetails = async (rentalId) => {
    setLoadingDetails(true);
    try {
      const res = await rentalService.getRentalById(rentalId);
      if (res && res.data) {
        setSelectedRental(res.data);
      }
    } catch (err) {
      console.error('Error fetching rental details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredRentals = rentals.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.rental_id.toLowerCase().includes(term) ||
      (r.customer_name && r.customer_name.toLowerCase().includes(term)) ||
      (r.customer_phone && r.customer_phone.toLowerCase().includes(term)) ||
      r.plate_number.toLowerCase().includes(term) ||
      r.make.toLowerCase().includes(term) ||
      r.model.toLowerCase().includes(term) ||
      r.pickup_loc.toLowerCase().includes(term) ||
      r.return_loc.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' || r.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
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
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Rental Bookings Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor fleet leases, scheduled pickup/return locations, and automatic status updates
          </p>
        </div>

        <button
          onClick={fetchRentals}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Filters and Search */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 38 }}
              placeholder="Search by rental ID, customer, plate, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({rentals.length})
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`btn btn-sm ${statusFilter === 'Active' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Active ({rentals.filter((r) => r.status === 'Active').length})
            </button>
            <button
              onClick={() => setStatusFilter('Completed')}
              className={`btn btn-sm ${statusFilter === 'Completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed ({rentals.filter((r) => r.status === 'Completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Querying rentals from database..." />
      ) : filteredRentals.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No Rentals Found"
          description={
            rentals.length === 0
              ? 'No rental agreements registered in the database.'
              : 'No rentals match your filter.'
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Pickup & Return</th>
                <th>Dates</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((r) => (
                <tr key={r.rental_id}>
                  <td>
                    <code>{r.rental_id}</code>
                  </td>
                  <td>
                    <strong>{r.customer_name}</strong>
                    {r.customer_phone && (
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {r.customer_phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <div><strong>{r.make} {r.model}</strong></div>
                    <code style={{ fontSize: 11 }}>{formatPlateNumber(r.plate_number)}</code>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    <div>From: {r.pickup_loc}</div>
                    <div>To: {r.return_loc}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {formatDate(r.start_date)} &rarr; {formatDate(r.end_date)}
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleViewDetails(r.rental_id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rental Details Modal */}
      <Modal
        isOpen={!!selectedRental}
        onClose={() => setSelectedRental(null)}
        title={`Rental Record: ${selectedRental?.rental_id}`}
        size="default"
      >
        {selectedRental && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lifecycle Status:</span>
              <StatusBadge status={selectedRental.status} />
            </div>

            <div style={{
              backgroundColor: 'var(--bg-muted)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              fontSize: 13
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Customer Name</div>
                <strong>{selectedRental.customer_name}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Customer Phone</div>
                <strong>{selectedRental.customer_phone || '—'}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Customer ID</div>
                <strong>{selectedRental.customer_id}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Vehicle Plate</div>
                <strong>{formatPlateNumber(selectedRental.plate_number)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Vehicle Make / Model</div>
                <strong>{selectedRental.make} {selectedRental.model}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Vehicle Specs</div>
                <span>{selectedRental.type} &bull; {selectedRental.color} ({selectedRental.year})</span>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Start Date</div>
                <strong>{formatDate(selectedRental.start_date)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>End Date</div>
                <strong>{formatDate(selectedRental.end_date)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Pickup Location</div>
                <strong>{selectedRental.pickup_loc}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Return Location</div>
                <strong>{selectedRental.return_loc}</strong>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              * Rental completion is automated via MySQL Event Scheduler based on the designated end date.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RentalManagement;
