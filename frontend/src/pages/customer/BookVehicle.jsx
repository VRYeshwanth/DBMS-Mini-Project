import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import rentalService from '../../services/rentalService';
import vehicleService from '../../services/vehicleService';
import branchService from '../../services/branchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { calculateDays, formatDate } from '../../utils/formatters';
import {
  Car,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  ArrowLeft
} from 'lucide-react';

export const BookVehicle = () => {
  const { plateNumber: paramPlateNumber } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [plateNumber, setPlateNumber] = useState(paramPlateNumber || '');
  const [pickupLoc, setPickupLoc] = useState('');
  const [returnLoc, setReturnLoc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selected vehicle details preview
  const selectedVehicle = availableVehicles.find((v) => v.plate_number === plateNumber);

  useEffect(() => {
    const initData = async () => {
      setLoadingData(true);
      try {
        const [vehRes, branchRes] = await Promise.allSettled([
          vehicleService.getAvailableVehicles(),
          branchService.getAllBranches(),
        ]);

        if (vehRes.status === 'fulfilled' && vehRes.value?.data) {
          setAvailableVehicles(vehRes.value.data);
          // If paramPlateNumber provided, select it, else select first available
          if (!paramPlateNumber && vehRes.value.data.length > 0) {
            setPlateNumber(vehRes.value.data[0].plate_number);
          }
        }

        if (branchRes.status === 'fulfilled' && branchRes.value?.data) {
          setBranches(branchRes.value.data);
          // Default locations if available
          if (branchRes.value.data.length > 0) {
            setPickupLoc(branchRes.value.data[0].name);
            setReturnLoc(branchRes.value.data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load initial booking data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    initData();
  }, [paramPlateNumber]);

  // Set today as minimum start date
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!plateNumber || !pickupLoc || !returnLoc || !startDate || !endDate) {
      setError('Please fill in all rental fields.');
      return;
    }

    if (startDate > endDate) {
      setError('End date must be on or after start date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        plate_number: plateNumber,
        pickup_loc: pickupLoc,
        return_loc: returnLoc,
        start_date: startDate,
        end_date: endDate,
      };

      const res = await rentalService.createRental(payload);

      if (res && res.success && res.data?.rental_id) {
        // Success! Prompt flow:
        // Booking Form -> POST /api/rentals -> Payment Screen -> POST /api/payments
        navigate(`/payment/${res.data.rental_id}`, {
          state: {
            vehicle: selectedVehicle,
            rentalDetails: {
              rental_id: res.data.rental_id,
              plate_number: plateNumber,
              pickup_loc: pickupLoc,
              return_loc: returnLoc,
              start_date: startDate,
              end_date: endDate,
            }
          }
        });
      } else {
        setError(res?.message || 'Failed to create rental reservation.');
      }
    } catch (err) {
      console.error('Create rental error:', err);
      // Display exact backend validation error
      const backendError = err?.response?.data?.message || 'Server error occurred while creating booking.';
      setError(backendError);
    } finally {
      setSubmitting(false);
    }
  };

  const daysCount = calculateDays(startDate, endDate);

  if (loadingData) {
    return <LoadingSpinner message="Preparing vehicle reservation form..." />;
  }

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60, maxWidth: 900 }}>
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/vehicles"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to Vehicles
        </Link>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Book a Vehicle</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Step 1 of 2: Reserve your dates and pickup point. Payment will be finalized in the next step.
        </p>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'start'
      }}>
        {/* Booking Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Vehicle Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="plateNumber">
                Select Vehicle <span className="required">*</span>
              </label>
              <select
                id="plateNumber"
                className="form-control"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
              >
                <option value="">-- Choose an available vehicle --</option>
                {availableVehicles.map((v) => (
                  <option key={v.plate_number} value={v.plate_number}>
                    {v.make} {v.model} ({v.type} - {v.color}) [{v.plate_number}]
                  </option>
                ))}
              </select>
            </div>

            {/* Pickup & Return Locations */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="pickupLoc">
                  Pickup Location <span className="required">*</span>
                </label>
                <input
                  id="pickupLoc"
                  type="text"
                  list="pickupLocations"
                  className="form-control"
                  placeholder="e.g. Bangalore Central"
                  value={pickupLoc}
                  onChange={(e) => setPickupLoc(e.target.value)}
                  required
                />
                <datalist id="pickupLocations">
                  {branches.map((b) => (
                    <option key={`pickup-${b.branch_id}`} value={b.name} />
                  ))}
                  <option value="Bangalore Airport" />
                  <option value="Central Railway Station" />
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="returnLoc">
                  Return Location <span className="required">*</span>
                </label>
                <input
                  id="returnLoc"
                  type="text"
                  list="returnLocations"
                  className="form-control"
                  placeholder="e.g. Electronic City"
                  value={returnLoc}
                  onChange={(e) => setReturnLoc(e.target.value)}
                  required
                />
                <datalist id="returnLocations">
                  {branches.map((b) => (
                    <option key={`return-${b.branch_id}`} value={b.name} />
                  ))}
                  <option value="Bangalore Airport" />
                  <option value="Central Railway Station" />
                </datalist>
              </div>
            </div>

            {/* Rental Dates */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  min={todayStr}
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endDate">
                  End Date <span className="required">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  min={startDate || todayStr}
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{
              backgroundColor: '#FAF9F2',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              fontSize: 13,
              color: '#8A6700',
              border: '1px solid #EFE8C3',
              marginBottom: 20,
              display: 'flex',
              gap: 10,
              alignItems: 'center'
            }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <div>
                Rental will be created with status <strong>Active</strong>. You will proceed to the payment screen immediately after reservation.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner spinner-sm" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} />
                  Validating with Backend...
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Reserve & Proceed to Payment <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Selected Vehicle Summary Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ backgroundColor: '#FFFEFB', border: '1.5px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>Reservation Summary</h3>

            {selectedVehicle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#181818'
                  }}>
                    <Car size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, margin: 0 }}>
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h4>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {selectedVehicle.type} &bull; {selectedVehicle.color} &bull; {selectedVehicle.plate_number}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Selected Plate:</span>
                    <strong>{selectedVehicle.plate_number}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Registered Branch:</span>
                    <span>{selectedVehicle.branch_name || 'Main Branch'}</span>
                  </div>
                  {startDate && endDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Rental Duration:</span>
                      <strong style={{ color: '#8A6700' }}>{daysCount} day{daysCount > 1 ? 's' : ''}</strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Select a vehicle to preview reservation summary.
              </div>
            )}
          </div>

          {/* Customer Credentials Pill */}
          <div className="card" style={{ padding: 18, fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#16A34A" /> Customer Account
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Booking as: <strong>{user?.name || user?.email}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              Customer ID: {user?.customer_id || 'Auto-linked'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookVehicle;
