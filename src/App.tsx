import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthRoute from './components/auth/AuthRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const RiderRegistrationPage = lazy(() => import('./pages/RiderRegistrationPage'));
const RiderDashboardPage = lazy(() => import('./pages/rider/RiderDashboardPage'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-center" />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/rider-registration" element={<RiderRegistrationPage />} />
              
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants/:id" element={<RestaurantPage />} />
                <Route path="/cart" element={<CartPage />} />
                
                <Route element={<AuthRoute allowedRoles={['customer']} />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders/:id" element={<OrderTrackingPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                
                <Route element={<AuthRoute allowedRoles={['rider']} />}>
                  <Route path="/rider-dashboard" element={<RiderDashboardPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;