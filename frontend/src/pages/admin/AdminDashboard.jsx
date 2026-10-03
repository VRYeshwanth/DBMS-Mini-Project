import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatPlateNumber } from '../../utils/formatters';
import {
  Car,
  Users,
  KeyRound,
  Wrench,
  TrendingUp,
  Building2,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  BarChart3,
  DollarSign
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getDashboard();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating database aggregations and fleet stats..." />;
  }

  const stats = data?.statistics || {};
  const revenueByBranch = data?.revenue_by_branch || [];
  const rentalsByVehicle = data?.rentals_by_vehicle || [];
  const maintenanceCostByVehicle = data?.maintenance_cost_by_vehicle || [];

  // Max values for calculating relative visual bar widths
  const maxBranchRev = Math.max(...revenueByBranch.map((b) => Number(b.revenue) || 0), 1);
  const maxRentals = Math.max(...rentalsByVehicle.map((v) => Number(v.rental_count) || 0), 1);
  const maxMaintCost = Math.max(...maintenanceCostByVehicle.map((m) => Number(m.maintenance_cost) || 0), 1);

  return (
    <div>
      {/* Top Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>System Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Aggregated relational analytics powered by MySQL joins and database views
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <Link to="/admin/vehicles" className="btn btn-primary btn-sm">
            <PlusCircle size={14} /> Manage Fleet
          </Link>
        </div>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Primary KPI Grid (6 metrics from GET /api/dashboard) */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <StatCard
          icon={TrendingUp}
          label="Total Collected Revenue"
          value={formatCurrency(stats.total_revenue)}
          subtext="Verified Paid transactions"
          highlight={true}
        />

        <StatCard
          icon={KeyRound}
          label="Active Rentals"
          value={stats.active_rentals ?? 0}
          subtext="Vehicles currently on the road"
        />

        <StatCard
          icon={Car}
          label="Available Fleet"
          value={`${stats.available_vehicles ?? 0} / ${stats.total_vehicles ?? 0}`}
          subtext="Ready for instant booking"
        />

        <StatCard
          icon={Users}
          label="Registered Customers"
          value={stats.total_customers ?? 0}
          subtext="Customer accounts in database"
        />

        <StatCard
          icon={Wrench}
          label="Active Maintenance"
          value={stats.active_maintenance ?? 0}
          subtext="Vehicles under service"
        />

        <StatCard
          icon={Building2}
          label="Operational Branches"
          value={revenueByBranch.length}
          subtext="Active distribution hubs"
        />
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        {/* Revenue By Branch Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="#D9A900" />
              Revenue by Branch
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              SQL Aggregation
            </span>
          </div>

          {revenueByBranch.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
              No branch revenue data recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {revenueByBranch.map((branch) => {
                const rev = Number(branch.revenue) || 0;
                const percent = Math.round((rev / maxBranchRev) * 100);

                return (
                  <div key={branch.branch_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{branch.branch_name}</span>
                      <strong style={{ color: '#8A6700' }}>{formatCurrency(rev)}</strong>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{
                      height: 8,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-muted)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rentals Frequency By Vehicle */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={18} color="#D9A900" />
              Vehicle Rental Frequency
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Demand Analysis
            </span>
          </div>

          {rentalsByVehicle.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
              No rental records yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {rentalsByVehicle.map((veh) => {
                const count = Number(veh.rental_count) || 0;
                const percent = Math.round((count / maxRentals) * 100);

                return (
                  <div key={veh.plate_number}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>
                        <strong>{veh.make} {veh.model}</strong>{' '}
                        <code style={{ fontSize: 11 }}>{veh.plate_number}</code>
                      </span>
                      <strong>{count} rental{count === 1 ? '' : 's'}</strong>
                    </div>
                    <div style={{
                      height: 8,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-muted)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor: '#181818',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Cost By Vehicle Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={18} color="#D9A900" />
              Maintenance Cost by Vehicle
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Cumulative service and repair expenditure recorded across vehicle lifecycle
            </p>
          </div>
          <Link to="/admin/maintenance" className="btn btn-secondary btn-sm">
            View Maintenance Log
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>License Plate</th>
                <th>Vehicle Model</th>
                <th>Total Servicing Cost</th>
                <th>Cost Ratio</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceCostByVehicle.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: 24 }}>
                    No maintenance records logged in database.
                  </td>
                </tr>
              ) : (
                maintenanceCostByVehicle.map((item) => {
                  const cost = Number(item.maintenance_cost) || 0;
                  const ratio = Math.round((cost / maxMaintCost) * 100);

                  return (
                    <tr key={item.plate_number}>
                      <td>
                        <strong>{formatPlateNumber(item.plate_number)}</strong>
                      </td>
                      <td>
                        {item.make} {item.model}
                      </td>
                      <td>
                        <strong style={{ color: cost > 0 ? '#B91C1C' : 'var(--text-muted)' }}>
                          {formatCurrency(cost)}
                        </strong>
                      </td>
                      <td style={{ width: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            flex: 1,
                            height: 6,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#E5E7EB',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${ratio}%`,
                              backgroundColor: '#EF4444',
                              borderRadius: 'var(--radius-full)'
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#888', minWidth: 32 }}>
                            {ratio}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
