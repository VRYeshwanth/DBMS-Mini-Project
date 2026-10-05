import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import rentalService from '../../services/rentalService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { formatCurrency, formatDate, calculateDays } from '../../utils/formatters';
import {
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  Car,
  ArrowRight,
  Info
} from 'lucide-react';

export const PaymentPage = () => {
  const { rentalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State from booking step if navigated directly
  const passedRental = location.state?.rentalDetails;
  const passedVehicle = location.state?.vehicle;

  const [rental, setRental] = useState(passedRental || null);
  const [vehicle, setVehicle] = useState(passedVehicle || null);
  const [loading, setLoading] = useState(!passedRental);
  const [error, setError] = useState('');

  // Payment form state
  // Methods: UPI, Card, Cash (as supported by backend)
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  // Base daily rate estimation or calculated amount for the duration
  const [amount, setAmount] = useState('4500');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If rental details weren't passed in navigation state, fetch from backend
    if (!rental && rentalId) {
      const fetchRental = async () => {
        setLoading(true);
        try {
          const res = await rentalService.getRentalById(rentalId);
          if (res && res.data) {
            setRental(res.data);
            // Default amount estimate: days * 1500 or standard 4500
            const days = calculateDays(res.data.start_date, res.data.end_date);
            setAmount(String(days * 1800));
          }
        } catch (err) {
          console.error('Error fetching rental details:', err);
          setError('Failed to fetch rental reservation.');
        } finally {
          setLoading(false);
        }
      };

      fetchRental();
    } else if (rental) {
      const days = calculateDays(rental.start_date, rental.end_date);
      setAmount(String(days * 1800));
    }
  }, [rentalId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (!['UPI', 'Card', 'Cash'].includes(paymentMethod)) {
      setError('Invalid payment method selected.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rental_id: rentalId,
        amount: numAmount,
        payment_method: paymentMethod,
      };

      const res = await paymentService.createPayment(payload);

      if (res && res.success && res.data?.payment_id) {
        // Navigate to confirmation page
        navigate(`/confirmation/${res.data.payment_id}`, {
          state: {
            payment: {
              payment_id: res.data.payment_id,
              rental_id: rentalId,
              amount: numAmount,
              payment_method: paymentMethod,
              payment_status: 'Paid',
              payment_date: new Date().toISOString(),
            },
            rental: rental,
            vehicle: vehicle,
          }
        });
      } else {
        setError(res?.message || 'Failed to process payment.');
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err?.response?.data?.message || 'Payment processing failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading rental payment details..." />;
  }

  if (error && !rental) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 600 }}>
        <Alert type="danger" message={error} />
        <Link to="/my-rentals" className="btn btn-secondary">
          Go to My Rentals
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60, maxWidth: 960 }}>
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#8A6700', textTransform: 'uppercase', marginBottom: 4 }}>
          Step 2 of 2: Payment Settlement
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Complete Your Payment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Your rental reservation <strong>{rentalId}</strong> has been secured. Choose your preferred payment method below.
        </p>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'start'
      }}>
        {/* Payment Form */}
        <div className="card">
          <form onSubmit={handlePaymentSubmit}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Select Payment Method</h3>

            {/* Payment Method Selector */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24
            }}>
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                style={{
                  border: paymentMethod === 'UPI' ? '2px solid var(--primary-dark)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'UPI' ? 'var(--primary-light)' : '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <QrCode size={24} color={paymentMethod === 'UPI' ? '#8A6700' : '#666'} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#181818' }}>UPI</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                style={{
                  border: paymentMethod === 'Card' ? '2px solid var(--primary-dark)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'Card' ? 'var(--primary-light)' : '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <CreditCard size={24} color={paymentMethod === 'Card' ? '#8A6700' : '#666'} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#181818' }}>Card</span>
              </button>

              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                style={{
                  border: paymentMethod === 'Cash' ? '2px solid var(--primary-dark)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'Cash' ? 'var(--primary-light)' : '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Banknote size={24} color={paymentMethod === 'Cash' ? '#8A6700' : '#666'} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#181818' }}>Cash</span>
              </button>
            </div>

            {/* Payment Amount */}
            <div className="form-group">
              <label className="form-label">Payment Amount (₹)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <span style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                All inclusive: Rental duration charge, basic vehicle insurance, and road taxes.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8 }}
              disabled={submitting}
            >
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                  Processing Payment with Backend...
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Pay {formatCurrency(amount)} & Confirm Booking <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Rental Breakdown Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ border: '1.5px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Booking Information</h3>

            {rental && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Car size={22} color="#181818" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, margin: 0 }}>
                      {rental.make ? `${rental.make} ${rental.model}` : `Vehicle ${rental.plate_number}`}
                    </h4>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Plate: <strong>{rental.plate_number}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Rental ID:</span>
                    <code>{rental.rental_id || rentalId}</code>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Dates:</span>
                    <span>{formatDate(rental.start_date)} &rarr; {formatDate(rental.end_date)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pickup:</span>
                    <span>{rental.pickup_loc}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Return:</span>
                    <span>{rental.return_loc}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                    <span>Total Payable:</span>
                    <span style={{ color: '#8A6700' }}>{formatCurrency(amount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FAF9F2',
            border: '1px solid #EFE8C3',
            fontSize: 12,
            color: '#8A6700'
          }}>
            <ShieldCheck size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong>Instant Confirmation:</strong> Payment is linked immediately to Rental ID <code>{rentalId}</code> in the database.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
