import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-accent text-white mt-16">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="font-poppins font-bold text-2xl mb-1">🐔 {APP_NAME}</div>
            <p className="text-xs text-yellow-400 font-medium mb-3 tracking-wide">{APP_TAGLINE}</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fresh chicken delivered to your doorstep in Sivakasi. Quality guaranteed, hygiene first.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-sm mb-4 text-white/80 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/',              label: 'Home'      },
                { to: '/products',      label: 'Products'  },
                { to: '/cart',          label: 'Cart'      },
                { to: '/profile/orders',label: 'My Orders' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-secondary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-sm mb-4 text-white/80 uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={15} className="mt-0.5 text-secondary flex-shrink-0" />
                <span>Sivakasi, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={15} className="text-secondary flex-shrink-0" />
                <a href="tel:+91XXXXXXXXXX" className="hover:text-secondary transition-colors">+91 XXXXX XXXXX</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Clock size={15} className="text-secondary flex-shrink-0" />
                <span>Mon–Sun · 6 AM – 8 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {year} {APP_NAME}. All rights reserved.</p>
          <p className="text-xs text-gray-500">Made with ❤️ in Sivakasi</p>
        </div>
      </div>
    </footer>
  );
}
