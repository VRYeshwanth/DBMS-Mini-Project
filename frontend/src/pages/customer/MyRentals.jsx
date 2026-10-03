import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatPlateNumber } from '../../utils/formatters';
import {
  KeyRound,
  Car,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRentals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerService.getMyRentals();
      if (res && res.data) {
        setRentals(res.data);
      }
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setError(err?.response?.data?.message || 'Failed to load your rental history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const filteredRentals = rentals.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const activeCount = rentals.filter((r) => r.status === 'Active').length;
  const completedCount = rentals.filter((r) => r.status === 'Completed').length;

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28
      }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>My Rental History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Review past and active reservations, view receipts, and monitor vehicle return dates
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

      {/* Tabs / Filter Controls */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 24,
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: 12
      }}>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Bookings ({rentals.length})
        </button>
        <button
          onClick={() => setStatusFilter('Active')}
          className={`btn btn-sm ${statusFilter === 'Active' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setStatusFilter('Completed')}
          className={`btn btn-sm ${statusFilter === 'Completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving your rentals from database..." />
      ) : filteredRentals.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={statusFilter === 'ALL' ? 'No Rentals Found' : `No ${statusFilter} Rentals`}
          description={
            statusFilter === 'ALL'
              ? 'You have not booked any vehicles yet. Check out our available fleet to start your journey.'
              : `You have no rentals currently categorized as ${statusFilter}.`
          }
          action={
            <Link to="/vehicles" className="btn btn-primary btn-sm">
              Explore Available Fleet
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredRentals.map((rental) => {
            const hasPaid = !!rental.payment_id;

            return (
              <div
                key={rental.rental_id}
                className="card"
                style={{
                  borderLeft: rental.status === 'Active' ? '4px solid var(--primary-dark)' : '4px solid #D4D4D4',
                  padding: 24
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 16
                }}>
                  {/* Left: Vehicle Title & Rental ID */}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: rental.status === 'Active' ? 'var(--primary-light)' : '#F3F4F6',
                      color: rental.status === 'Active' ? '#8A6700' : '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Car size={24} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#888' }}>
                          #{rental.rental_id}
                        </span>
                        <StatusBadge status={rental.status} />
                        {hasPaid ? (
                          <span className="badge badge-active">Paid ({rental.payment_method})</span>
                        ) : (
                          <span className="badge badge-warning">Unpaid</span>
                        )}
                      </div>

                      <h3 style={{ fontSize: 18, margin: 0 }}>
                        {rental.make} {rental.model} ({formatPlateNumber(rental.plate_number)})
                      </h3>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {rental.type} &bull; {rental.color} &bull; Year {rental.year}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Amount or Pay Button */}
                  <div style={{ textAlign: 'right' }}>
                    {hasPaid ? (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount Paid</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#181818' }}>
                          {formatCurrency(rental.amount)}
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          Ref: {rental.payment_id}
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={`/payment/${rental.rental_id}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <CreditCard size={14} /> Pay Now
                      </Link>
                    )}
                  </div>
                </div>

                {/* Details Footer: Dates and Locations */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  backgroundColor: 'var(--bg-muted)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Calendar size={14} /> Rental Period
                    </div>
                    <strong>{formatDate(rental.start_date)} &rarr; {formatDate(rental.end_date)}</strong>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <MapPin size={14} /> Pickup Point
                    </div>
                    <span>{rental.pickup_loc}</span>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <MapPin size={14} /> Return Point
                    </div>
                    <span>{rental.return_loc}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRentals;
