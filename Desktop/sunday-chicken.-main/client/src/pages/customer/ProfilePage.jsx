import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, LogOut, Phone, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const MENU_ITEMS = [
    { icon: <Package size={18} />, label: 'My Orders',    sub: 'View all your orders',   onClick: () => navigate('/profile/orders') },
    { icon: <Phone size={18} />,   label: 'Contact Us',   sub: 'Call or WhatsApp us',    onClick: () => {} },
  ];

  return (
    <MainLayout>
      <div className="container-app py-8 max-w-md mx-auto">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="font-poppins font-bold text-3xl text-primary">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <h2 className="font-poppins font-bold text-xl text-accent">{user?.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
            <Phone size={12} /> {user?.phone}
          </p>
        </motion.div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-5">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-primary flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-accent">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl shadow-card text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </MainLayout>
  );
}
