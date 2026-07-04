import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui';

// ── Lazy-loaded customer pages ────────────────────────────────────
const HomePage             = lazy(() => import('@/pages/customer/HomePage'));
const ProductsPage         = lazy(() => import('@/pages/customer/ProductsPage'));
const ProductDetailPage    = lazy(() => import('@/pages/customer/ProductDetailPage'));
const CartPage             = lazy(() => import('@/pages/customer/CartPage'));
const LoginPage            = lazy(() => import('@/pages/customer/LoginPage'));
const RegisterPage         = lazy(() => import('@/pages/customer/RegisterPage'));
const CheckoutPage         = lazy(() => import('@/pages/customer/CheckoutPage'));
const OrderConfirmationPage= lazy(() => import('@/pages/customer/OrderConfirmationPage'));
const OrderStatusPage      = lazy(() => import('@/pages/customer/OrderStatusPage'));
const ProfilePage          = lazy(() => import('@/pages/customer/ProfilePage'));
const MyOrdersPage         = lazy(() => import('@/pages/customer/MyOrdersPage'));

// ── Lazy-loaded admin pages ───────────────────────────────────────
const AdminDashboardPage   = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminOrdersPage      = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminProductsPage    = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminCustomersPage   = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminReportsPage     = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminSettingsPage    = lazy(() => import('@/pages/admin/AdminSettingsPage'));

// ── Route guards ──────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/products"  element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart"      element={<CartPage />} />

        {/* Guest-only */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected customer */}
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        <Route path="/orders/:orderId"             element={<ProtectedRoute><OrderStatusPage /></ProtectedRoute>} />
        <Route path="/profile"                     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/orders"              element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/orders"    element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
        <Route path="/admin/products"  element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomersPage /></ProtectedRoute>} />
        <Route path="/admin/reports"   element={<ProtectedRoute adminOnly><AdminReportsPage /></ProtectedRoute>} />
        <Route path="/admin/settings"  element={<ProtectedRoute adminOnly><AdminSettingsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
