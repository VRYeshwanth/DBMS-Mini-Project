import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseVehicles from './pages/customer/BrowseVehicles';
import VehicleDetails from './pages/customer/VehicleDetails';
import BookVehicle from './pages/customer/BookVehicle';
import PaymentPage from './pages/customer/PaymentPage';
import ConfirmationPage from './pages/customer/ConfirmationPage';
import MyRentals from './pages/customer/MyRentals';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerManagement from './pages/admin/CustomerManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import RentalManagement from './pages/admin/RentalManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import MaintenanceManagement from './pages/admin/MaintenanceManagement';
import BranchManagement from './pages/admin/BranchManagement';

// 404
import NotFound from './pages/common/NotFound';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public / Customer Layout Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="/vehicles" element={<BrowseVehicles />} />
            <Route path="/vehicles/:plateNumber" element={<VehicleDetails />} />

            {/* Protected Customer Routes */}
            <Route
              path="/book/:plateNumber?"
              element={
                <ProtectedRoute requiredRole="customer">
                  <BookVehicle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:rentalId"
              element={
                <ProtectedRoute requiredRole="customer">
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmation/:paymentId"
              element={
                <ProtectedRoute requiredRole="customer">
                  <ConfirmationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-rentals"
              element={
                <ProtectedRoute requiredRole="customer">
                  <MyRentals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Layout Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="rentals" element={<RentalManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="maintenance" element={<MaintenanceManagement />} />
            <Route path="branches" element={<BranchManagement />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
