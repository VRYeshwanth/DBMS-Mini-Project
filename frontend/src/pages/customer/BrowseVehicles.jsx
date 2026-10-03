import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import VehicleCard from '../../components/vehicles/VehicleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { Search, Filter, Car, RefreshCw } from 'lucide-react';

export const BrowseVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedColor, setSelectedColor] = useState('ALL');

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vehicleService.getAvailableVehicles();
      if (res && res.data) {
        setVehicles(res.data);
      }
    } catch (err) {
      console.error('Error fetching available vehicles:', err);
      setError('Failed to fetch available vehicles. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Compute unique types & colors for filter options
  const vehicleTypes = ['ALL', ...new Set(vehicles.map((v) => v.type).filter(Boolean))];
  const vehicleColors = ['ALL', ...new Set(vehicles.map((v) => v.color).filter(Boolean))];

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      searchTerm === '' ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.branch_name && v.branch_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || v.type.toLowerCase() === selectedType.toLowerCase();
    const matchesColor = selectedColor === 'ALL' || v.color.toLowerCase() === selectedColor.toLowerCase();

    return matchesSearch && matchesType && matchesColor;
  });

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28
      }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Browse Fleet</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Discover and book available vehicles with verified condition and live branch availability
          </p>
        </div>

        <button
          onClick={fetchVehicles}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 20, marginBottom: 32 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          alignItems: 'flex-end'
        }}>
          {/* Search Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Vehicle or Branch</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 38 }}
                placeholder="Search by make, model, plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          {/* Type Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Vehicle Category</label>
            <select
              className="form-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'ALL' ? 'All Categories' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Exterior Color</label>
            <select
              className="form-control"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {vehicleColors.map((color) => (
                <option key={color} value={color}>
                  {color === 'ALL' ? 'All Colors' : color}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedColor('ALL');
              }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Grid or States */}
      {loading ? (
        <LoadingSpinner message="Checking vehicle availability with database..." />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Available Vehicles Found"
          description={
            vehicles.length === 0
              ? 'There are currently no vehicles available for rent in our database.'
              : 'No vehicles match your active search filters. Try clearing your filters.'
          }
          action={
            (searchTerm || selectedType !== 'ALL' || selectedColor !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('ALL');
                  setSelectedColor('ALL');
                }}
                className="btn btn-primary btn-sm"
              >
                Reset Search Filters
              </button>
            ) : null
          }
        />
      ) : (
        <div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, fontWeight: 500 }}>
            Showing <strong>{filteredVehicles.length}</strong> available vehicle{filteredVehicles.length === 1 ? '' : 's'}
          </div>
          <div className="grid-3">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.plate_number} vehicle={vehicle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseVehicles;
