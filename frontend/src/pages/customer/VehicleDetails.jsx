import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import vehicleService from '../../services/vehicleService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { formatPlateNumber } from '../../utils/formatters';
import {
  Car,
  Calendar,
  Palette,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Building2,
  FileText
} from 'lucide-react';

export const VehicleDetails = () => {
  const { plateNumber } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await vehicleService.getVehicleByPlateNumber(plateNumber);
        if (res && res.data) {
          setVehicle(res.data);
        } else {
          setError('Vehicle not found.');
        }
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError(err?.response?.data?.message || 'Failed to fetch vehicle information.');
      } finally {
        setLoading(false);
      }
    };

    if (plateNumber) {
      fetchVehicle();
    }
  }, [plateNumber]);

  if (loading) {
    return <LoadingSpinner message="Fetching vehicle specifications..." />;
  }

  if (error || !vehicle) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: 600 }}>
        <Alert type="danger" message={error || 'Vehicle not found.'} />
        <Link to="/vehicles" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60, maxWidth: 960 }}>
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/vehicles"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}
        >
          <ArrowLeft size={16} /> Back to Available Vehicles
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        alignItems: 'start'
      }}>
        {/* Left Side: Vehicle Visual Card */}
        <div className="card" style={{
          padding: 36,
          backgroundColor: '#FFFDF0',
          border: '2px solid #FBE895',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #181818',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 16px',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 1.5,
            marginBottom: 28,
            boxShadow: '0 2px 0 #181818'
          }}>
            {formatPlateNumber(vehicle.plate_number)}
          </div>

          <div style={{ margin: '20px 0' }}>
            <Car size={100} color="#D9A900" strokeWidth={1.2} />
          </div>

          <h2 style={{ fontSize: 26, margin: '12px 0 4px' }}>
            {vehicle.make} {vehicle.model}
          </h2>
          <div style={{ fontSize: 14, color: '#8A6700', fontWeight: 600 }}>
            {vehicle.type} Class &bull; {vehicle.year} Model
          </div>

          <div style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid #F5E180',
            display: 'flex',
            justifyContent: 'center',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
              <ShieldCheck size={16} color="#16A34A" /> Insured
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
              <CheckCircle size={16} color="#16A34A" /> Sanitized
            </div>
          </div>
        </div>

        {/* Right Side: Specifications & Booking CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 20, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              Vehicle Specifications
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 20
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Manufacturer
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                  {vehicle.make}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Model
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                  {vehicle.model}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Category / Body
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                  {vehicle.type}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Year of Registration
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                  {vehicle.year}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Exterior Color
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                  {vehicle.color}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  License Plate
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, fontFamily: 'monospace' }}>
                  {vehicle.plate_number}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Branch Details */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={20} color="#D9A900" />
              Branch Location
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
              <div>
                <strong>Branch:</strong> {vehicle.branch_name || 'Main Branch'}
              </div>
              <div>
                <strong>Address:</strong> {vehicle.branch_address || 'Central City Hub'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Branch ID: <code>{vehicle.branch_id}</code>
              </div>
            </div>
          </div>

          {/* Rent Now Action CTA */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            boxShadow: 'var(--shadow-yellow)'
          }}>
            <h4 style={{ fontSize: 18, marginBottom: 8 }}>Ready to Drive?</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Reserve this vehicle in seconds. Our system checks dates and availability automatically.
            </p>
            <Link
              to={`/book/${encodeURIComponent(vehicle.plate_number)}`}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              <span>Proceed to Booking</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
