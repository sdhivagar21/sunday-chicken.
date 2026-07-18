import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui';

const HomePage              = lazy(() => import('@/pages/customer/HomePage'));
const ProductsPage          = lazy(() => import('@/pages/customer/ProductsPage'));
const ProductDetailPage     = lazy(() => import('@/pages/customer/ProductDetailPage'));
const CartPage              = lazy(() => import('@/pages/customer/CartPage'));
const LoginPage             = lazy(() => import('@/pages/customer/LoginPage'));
const RegisterPage          = lazy(() => import('@/pages/customer/RegisterPage'));
const CheckoutPage          = lazy(() => import('@/pages/customer/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/customer/OrderConfirmationPage'));
const OrderStatusPage       = lazy(() => import('@/pages/customer/OrderStatusPage'));
const ProfilePage           = lazy(() => import('@/pages/customer/ProfilePage'));
const MyOrdersPage          = lazy(() => import('@/pages/customer/MyOrdersPage'));

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminOrdersPage    = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminProductsPage  = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'));
const AdminReportsPage   = lazy(() => import('@/pages/admin/AdminReportsPage'));
const AdminSettingsPage  = lazy(() => import('@/pages/admin/AdminSettingsPage'));

// Admin only route
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}

// Redirect logged-in users away from login/register
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

// Needs login (profile, my orders)
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── PUBLIC — no login needed at all ── */}
        <Route path="/"                            element={<HomePage />} />
        <Route path="/products"                    element={<ProductsPage />} />
        <Route path="/products/:id"                element={<ProductDetailPage />} />
        <Route path="/cart"                        element={<CartPage />} />
        <Route path="/checkout"                    element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/orders/:orderId"             element={<OrderStatusPage />} />

        {/* ── GUEST only ── */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── LOGGED IN customers only ── */}
        <Route path="/profile"        element={<AuthRoute><ProfilePage /></AuthRoute>} />
        <Route path="/profile/orders" element={<AuthRoute><MyOrdersPage /></AuthRoute>} />

        {/* ── ADMIN only ── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/orders"    element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/products"  element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
        <Route path="/admin/reports"   element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
        <Route path="/admin/settings"  element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
