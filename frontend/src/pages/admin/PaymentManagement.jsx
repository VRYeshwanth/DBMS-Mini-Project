import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, formatPlateNumber } from '../../utils/formatters';
import {
  CreditCard,
  Search,
  RefreshCw,
  TrendingUp,
  Receipt,
  QrCode,
  Banknote,
  DollarSign
} from 'lucide-react';

export const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.getAllPayments();
      if (res && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err?.response?.data?.message || 'Failed to fetch payments from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const upiCount = payments.filter((p) => p.payment_method === 'UPI').length;
  const cardCount = payments.filter((p) => p.payment_method === 'Card').length;
  const cashCount = payments.filter((p) => p.payment_method === 'Cash').length;

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.payment_id.toLowerCase().includes(term) ||
      p.rental_id.toLowerCase().includes(term) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(term)) ||
      (p.plate_number && p.plate_number.toLowerCase().includes(term)) ||
      (p.make && p.make.toLowerCase().includes(term));

    const matchesMethod =
      methodFilter === 'ALL' || p.payment_method === methodFilter;

    return matchesSearch && matchesMethod;
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
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Payment Transactions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Audited financial records and settlement logs with strict 1:1 rental payment constraints
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Summary KPI Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-dark)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{formatCurrency(totalCollected)}</div>
            <div className="stat-label">Total Revenue Collected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Receipt size={24} />
          </div>
          <div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">Total Settled Receipts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Methods Breakdown</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              UPI: <strong>{upiCount}</strong> &bull; Card: <strong>{cardCount}</strong> &bull; Cash: <strong>{cashCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search by payment ID, rental ID, customer, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMethodFilter('ALL')}
              className={`btn btn-sm ${methodFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Methods
            </button>
            <button
              onClick={() => setMethodFilter('UPI')}
              className={`btn btn-sm ${methodFilter === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
            >
              UPI ({upiCount})
            </button>
            <button
              onClick={() => setMethodFilter('Card')}
              className={`btn btn-sm ${methodFilter === 'Card' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Card ({cardCount})
            </button>
            <button
              onClick={() => setMethodFilter('Cash')}
              className={`btn btn-sm ${methodFilter === 'Cash' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Cash ({cashCount})
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingSpinner message="Querying payments table..." />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Payment Records Found"
          description="No payment records match your query."
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Rental Reference</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Date & Time</th>
                <th>Method</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.payment_id}>
                  <td>
                    <code style={{ fontWeight: 700 }}>{p.payment_id}</code>
                  </td>
                  <td>
                    <code>{p.rental_id}</code>
                  </td>
                  <td>
                    <strong>{p.customer_name}</strong>
                  </td>
                  <td>
                    <span>{p.make} {p.model}</span>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {formatPlateNumber(p.plate_number)}
                    </div>
                  </td>
                  <td>
                    {formatDateTime(p.payment_date)}
                  </td>
                  <td>
                    <span className="badge badge-yellow">
                      {p.payment_method}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={p.payment_status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: 15, color: '#181818' }}>
                      {formatCurrency(p.amount)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
