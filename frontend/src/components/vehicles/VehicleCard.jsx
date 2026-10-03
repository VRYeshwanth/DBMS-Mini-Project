import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Calendar, Palette, ArrowRight } from 'lucide-react';
import { formatPlateNumber } from '../../utils/formatters';

export const VehicleCard = ({ vehicle, onRent = null }) => {
  const {
    plate_number,
    make,
    model,
    type,
    year,
    color,
    branch_name,
    branch_address,
  } = vehicle;

  // Visual vehicle category representation with subtle accent colors
  const getTypeBadgeColor = (vehType) => {
    const t = String(vehType).toLowerCase();
    if (t.includes('suv')) return 'badge-yellow';
    if (t.includes('sedan')) return 'badge-active';
    if (t.includes('hatchback')) return 'badge-warning';
    return 'badge-completed';
  };

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Banner / Illustration Placeholder */}
      <div style={{
        backgroundColor: '#FFFDF0',
        border: '1px solid #FDF0B5',
        borderRadius: 'var(--radius-md)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 16
      }}>
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          display: 'flex',
          gap: 6
        }}>
          <span className={`badge ${getTypeBadgeColor(type)}`}>
            {type}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: 11,
          fontFamily: 'var(--font-mono, monospace)',
          fontWeight: 700,
          backgroundColor: '#FFFFFF',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #EAEAEA',
          color: '#181818'
        }}>
          {formatPlateNumber(plate_number)}
        </div>

        <Car size={56} color="#D9A900" strokeWidth={1.5} style={{ margin: '14px 0' }} />

        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#8A6700',
          letterSpacing: 0.5,
          textTransform: 'uppercase'
        }}>
          {make} Premium Collection
        </div>
      </div>

      {/* Vehicle Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 20, marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span>{make}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{model}</span>
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 12px',
          margin: '12px 0 16px',
          fontSize: 13,
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} color="#999" />
            <span>Year: <strong style={{ color: 'var(--text-main)' }}>{year}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={15} color="#999" />
            <span>Color: <strong style={{ color: 'var(--text-main)' }}>{color}</strong></span>
          </div>
        </div>

        {/* Branch / Location */}
        {(branch_name || branch_address) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-muted)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16
          }}>
            <MapPin size={14} color="#D9A900" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ lineHeight: 1.3 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{branch_name}</span>
              {branch_address && <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11 }}>{branch_address}</span>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
          <Link
            to={`/vehicles/${encodeURIComponent(plate_number)}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            Details
          </Link>
          <Link
            to={`/book/${encodeURIComponent(plate_number)}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1.2 }}
          >
            <span>Rent Now</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
