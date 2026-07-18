import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { APP_NAME, APP_TAGLINE } from '@/constants';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/products', label: 'Products' },
  ];

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-40 bg-white transition-shadow duration-300
        ${scrolled ? 'shadow-md' : 'shadow-sm'}
      `}>
        <div className="container-app">
          <div className="flex items-center justify-between h-16 md:h-[70px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex flex-col leading-none group">
              <span className="font-poppins font-bold text-xl text-primary group-hover:text-red-700 transition-colors">
                🐔 {APP_NAME}
              </span>
              <span className="text-[10px] font-medium text-gray-400 tracking-wide mt-0.5">
                {APP_TAGLINE}
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    font-medium text-sm transition-colors duration-150
                    ${location.pathname === to
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <ShoppingCart size={22} className="text-accent" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User menu (desktop) */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-accent max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                          <User size={15} /> My Profile
                        </Link>
                        <Link to="/profile/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                          <Package size={15} /> My Orders
                        </Link>
                        <hr className="my-1.5 border-gray-100" />
                        <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                          <LogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold py-2 px-5 rounded-button hover:bg-red-700 transition-colors"
                >
                  Login
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {menuOpen ? <X size={22} className="text-accent" /> : <Menu size={22} className="text-accent" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="container-app py-3 space-y-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block py-2.5 px-3 rounded-xl text-sm font-medium transition-colors
                      ${location.pathname === to ? 'bg-red-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin/dashboard" className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Admin Panel
                  </Link>
                )}
                <hr className="border-gray-100 my-1" />
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/profile/orders" className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={16} /> My Orders
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full">
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-primary">
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content going under fixed navbar */}
      <div className="h-16 md:h-[70px]" />
    </>
  );
}
