import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';

const BADGES = [
  { icon: <Clock size={13} />,       text: 'Delivered Fresh Daily'  },
  { icon: <ShieldCheck size={13} />, text: 'Hygiene Certified'       },
  { icon: <Truck size={13} />,       text: 'Doorstep Delivery'       },
];

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-red-50 via-white to-yellow-50 overflow-hidden">
      <div className="container-app py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-6">

          {/* ── Text Side ── */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
            >
              🏪 Currently Serving Sivakasi Only
            </motion.div>

            <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl text-accent leading-tight mb-5">
              Fresh Chicken,{' '}
              <span className="text-primary">Right at Your{' '}</span>
              <span className="relative">
                Door
                <motion.span
                  className="absolute -bottom-1 left-0 h-1 bg-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                />
              </span>
            </h1>

            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              Order premium quality fresh chicken online. Cleaned, cut to your preference, and delivered within the hour.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
              {BADGES.map(({ icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-primary">{icon}</span>
                  {text}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button size="lg" onClick={() => navigate('/products')} icon={<ArrowRight size={18} />}>
                Order Now
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/products')}>
                View Products
              </Button>
            </div>
          </motion.div>

          {/* ── Image / Visual Side ── */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full bg-red-100 opacity-60" />
              <div className="absolute inset-6 rounded-full bg-yellow-100 opacity-70" />

              {/* Emoji hero */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-[120px] md:text-[160px] select-none"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🐔
              </motion.div>

              {/* Floating cards */}
              <motion.div
                className="absolute -top-2 -right-4 bg-white rounded-2xl shadow-card px-4 py-2.5 flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-xl">⭐</span>
                <div>
                  <div className="text-xs font-bold text-accent">4.9 Rating</div>
                  <div className="text-[10px] text-gray-400">500+ orders</div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-2 -left-4 bg-white rounded-2xl shadow-card px-4 py-2.5 flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <span className="text-xl">🕐</span>
                <div>
                  <div className="text-xs font-bold text-accent">30–45 min</div>
                  <div className="text-[10px] text-gray-400">Avg delivery</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
