import React, { useState, useEffect } from 'react';
import customerService from '../../services/customerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatDateTime, formatPlateNumber } from '../../utils/formatters';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  Car
} from 'lucide-react';

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected customer for modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerService.getAllCustomers();
      if (res && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err?.response?.data?.message || 'Failed to fetch customer list from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewDetails = async (customerId) => {
    setSelectedCustomerId(customerId);
    setLoadingDetails(true);
    setModalError('');
    try {
      const res = await customerService.getCustomerById(customerId);
      if (res && res.data) {
        setCustomerDetails(res.data);
      } else {
        setModalError('Customer not found.');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setModalError(err?.response?.data?.message || 'Failed to fetch customer details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null);
    setModalError('');
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.customer_id.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Customer Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            View registered customers, personal records, and comprehensive rental histories
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Search Bar */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 38 }}
            placeholder="Search customer by name, email, phone, or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
        </div>
      </div>

      {/* Customer Table */}
      {loading ? (
        <LoadingSpinner message="Querying customers from database..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Customers Found"
          description={
            customers.length === 0
              ? 'No registered customers exist in the CUSTOMER table.'
              : 'No customers match your search criteria.'
          }
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.customer_id}>
                  <td>
                    <code>{customer.customer_id}</code>
                  </td>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '—'}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {customer.address || '—'}
                  </td>
                  <td>{formatDate(customer.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleViewDetails(customer.customer_id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Details & Rental History Modal */}
      <Modal
        isOpen={!!selectedCustomerId}
        onClose={handleCloseModal}
        title={`Customer Details: ${customerDetails?.name || selectedCustomerId}`}
        size="lg"
      >
        {loadingDetails ? (
          <LoadingSpinner message="Loading customer profile and rental history..." />
        ) : modalError ? (
          <Alert type="danger" message={modalError} />
        ) : customerDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Customer Info Card */}
            <div style={{
              backgroundColor: 'var(--bg-muted)',
              padding: 20,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              fontSize: 13
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Customer ID</div>
                <strong>{customerDetails.customer_id}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>User ID</div>
                <strong>{customerDetails.user_id}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Email</div>
                <strong>{customerDetails.email}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Phone</div>
                <strong>{customerDetails.phone || 'Not provided'}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Date of Birth</div>
                <strong>{formatDate(customerDetails.dob)}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Registration Date</div>
                <strong>{formatDate(customerDetails.created_at)}</strong>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--text-muted)' }}>Address</div>
                <strong>{customerDetails.address || 'Not provided'}</strong>
              </div>
            </div>

            {/* Customer Rental History */}
            <div>
              <h4 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyRound size={18} color="#D9A900" />
                Customer Rental History ({customerDetails.rentals?.length || 0})
              </h4>

              {(!customerDetails.rentals || customerDetails.rentals.length === 0) ? (
                <div style={{ textAlign: 'center', padding: 24, backgroundColor: '#FAF9F2', borderRadius: 'var(--radius-md)', color: '#888', fontSize: 13 }}>
                  This customer has no rental reservations in the database.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rental ID</th>
                        <th>Vehicle</th>
                        <th>Pickup & Return</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerDetails.rentals.map((r) => (
                        <tr key={r.rental_id}>
                          <td><code>{r.rental_id}</code></td>
                          <td>
                            <strong>{r.make} {r.model}</strong>
                            <div style={{ fontSize: 11, color: '#888' }}>
                              {formatPlateNumber(r.plate_number)}
                            </div>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            <div><strong>From:</strong> {r.pickup_loc}</div>
                            <div><strong>To:</strong> {r.return_loc}</div>
                          </td>
                          <td style={{ fontSize: 12 }}>
                            {formatDate(r.start_date)} &rarr; {formatDate(r.end_date)}
                          </td>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CustomerManagement;
