import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, formatDateTime, formatPlateNumber } from '../../utils/formatters';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Car,
  CreditCard,
  Printer,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ConfirmationPage = () => {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentDetails, setPaymentDetails] = useState(location.state?.payment || null);
  const [rentalDetails, setRentalDetails] = useState(location.state?.rental || null);
  const [loading, setLoading] = useState(!paymentDetails);
  const [error, setError] = useState('');

  useEffect(() => {
    // If not passed through route state, load payment details by paymentId
    if (!paymentDetails && paymentId) {
      const fetchPayment = async () => {
        setLoading(true);
        try {
          const res = await paymentService.getPaymentById(paymentId);
          if (res && res.data) {
            setPaymentDetails(res.data);
            setRentalDetails({
              rental_id: res.data.rental_id,
              plate_number: res.data.plate_number,
              make: res.data.make,
              model: res.data.model,
              type: res.data.type,
              pickup_loc: res.data.pickup_loc,
              return_loc: res.data.return_loc,
              start_date: res.data.start_date,
              end_date: res.data.end_date,
            });
          }
        } catch (err) {
          console.error('Error fetching payment confirmation:', err);
          setError('Could not retrieve payment record.');
        } finally {
          setLoading(false);
        }
      };

      fetchPayment();
    }
  }, [paymentId, paymentDetails]);

  if (loading) {
    return <LoadingSpinner message="Generating reservation invoice..." />;
  }

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60, maxWidth: 800 }}>
      {/* Success Badge */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 68,
          height: 68,
          borderRadius: '50%',
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
        }}>
          <CheckCircle2 size={40} />
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
          Thank you for choosing Velocity Rentals. Your payment has been processed and your reservation is confirmed.
        </p>
      </div>

      {/* Confirmation Receipt Card */}
      <div className="card" style={{
        padding: 32,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        marginBottom: 28
      }}>
        {/* Receipt Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Payment Reference
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: '#181818' }}>
              {paymentDetails?.payment_id || paymentId}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Status:</span>
            <StatusBadge status={paymentDetails?.payment_status || 'Paid'} />
          </div>
        </div>

        {/* Primary Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 28
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Rental ID
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', marginTop: 4 }}>
              {paymentDetails?.rental_id || rentalDetails?.rental_id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Payment Date
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
              {formatDateTime(paymentDetails?.payment_date)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Payment Method
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={16} color="#8A6700" />
              {paymentDetails?.payment_method}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Amount Paid
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#8A6700', marginTop: 2 }}>
              {formatCurrency(paymentDetails?.amount)}
            </div>
          </div>
        </div>

        {/* Vehicle & Journey Section */}
        <div style={{
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#181818'
            }}>
              <Car size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, margin: 0 }}>
                {rentalDetails?.make ? `${rentalDetails.make} ${rentalDetails.model}` : 'Reserved Vehicle'}
              </h3>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                License Plate: <strong>{formatPlateNumber(rentalDetails?.plate_number || paymentDetails?.plate_number)}</strong>
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 14,
            fontSize: 13
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} /> Rental Period
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>
                {formatDate(rentalDetails?.start_date)} &rarr; {formatDate(rentalDetails?.end_date)}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} /> Pickup Location
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>
                {rentalDetails?.pickup_loc || 'Central Branch'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} /> Return Location
              </div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>
                {rentalDetails?.return_loc || 'Central Branch'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <button
          onClick={() => window.print()}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Printer size={16} /> Print Receipt
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/my-rentals" className="btn btn-secondary">
            View My Rentals
          </Link>
          <Link to="/vehicles" className="btn btn-primary">
            <span>Browse More Vehicles</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
