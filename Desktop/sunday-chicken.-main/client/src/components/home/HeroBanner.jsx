import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck, Truck, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

const BADGES = [
  { icon: <Clock size={13} />,       text: 'Delivered Fresh Daily' },
  { icon: <ShieldCheck size={13} />, text: 'Hygiene Certified'      },
  { icon: <Truck size={13} />,       text: 'Doorstep Delivery'      },
];

export default function HeroBanner() {
  const navigate = useNavigate();
  return (
    <>
      <HeroTop onOrder={() => navigate('/products')} />
      <LazySundayPromo onOrder={() => navigate('/products')} />
    </>
  );
}

/* ── PART 1: Top Hero ───────────────────────────────────────────── */
function HeroTop({ onOrder }) {
  return (
    <section className="relative bg-gradient-to-br from-red-50 via-white to-yellow-50 overflow-hidden min-h-[92vh] flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full opacity-30 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-100 rounded-full opacity-40 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

      <div className="container-app py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Text */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
            >
              🏪 Currently Serving Sivakasi Only
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl text-accent leading-tight mb-4"
            >
              Fresh Chicken,{' '}
              <span className="text-primary">Right at Your{' '}</span>
              <span className="relative inline-block">
                Door
                <motion.span
                  className="absolute -bottom-1 left-0 h-1 bg-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0"
            >
              Order premium quality fresh chicken online. Cleaned, cut to your preference, and delivered within the hour.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-2 justify-center md:justify-start mb-8"
            >
              {BADGES.map(({ icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 bg-white text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-primary">{icon}</span>
                  {text}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              <Button size="lg" onClick={onOrder} icon={<ArrowRight size={18} />}>
                Order Now
              </Button>
              <Button size="lg" variant="ghost" onClick={onOrder}>
                View Products
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-red-100 opacity-60" />
              <div className="absolute inset-6 rounded-full bg-yellow-100 opacity-70" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-[120px] md:text-[160px] select-none"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🐔
              </motion.div>
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

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}

/* ── PART 2: Lazy Sunday Promo ──────────────────────────────────── */
function LazySundayPromo({ onOrder }) {
  return (
    <section className="bg-accent text-white overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      <div className="container-app py-16 md:py-24 relative z-10">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
            Why Sunday Chicken?
          </span>
        </motion.div>

        {/* BIG HEADLINE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-6"
        >
          <h2 className="font-poppins font-bold text-3xl md:text-5xl lg:text-6xl leading-tight">
            This is for{' '}
            <span className="text-secondary">Lazy People</span>
            <br />
            who want to{' '}
            <span className="text-primary">Take Rest</span>{' '}
            on Sunday
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          And don't need to stand in a long queue at the chicken shop in the hot sun —
          we bring it fresh to your door. 😎
        </motion.p>

        {/* Emoji comic strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 md:gap-6 mb-14 flex-wrap"
        >
          {[
            { emoji: '😴', label: 'You relax'  },
            { emoji: '→',  label: ''            },
            { emoji: '📱', label: 'You order'   },
            { emoji: '→',  label: ''            },
            { emoji: '🛵', label: 'We deliver'  },
            { emoji: '→',  label: ''            },
            { emoji: '🍗', label: 'You eat'     },
          ].map(({ emoji, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-4xl md:text-5xl">{emoji}</span>
              {label && <span className="text-xs text-gray-500">{label}</span>}
            </div>
          ))}
        </motion.div>

        {/* Video + Photo grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* ── VIDEO — Replace YOUR_VIDEO_ID with your YouTube video ID ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10"
          >
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0&modestbranding=1"
                title="Sunday Chicken — Fresh Delivery in Sivakasi"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-gray-400 text-center py-3">
              🎬 See how we prepare and deliver your fresh chicken
            </p>
          </motion.div>

          {/* Photo grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { emoji: '🐔', label: 'Farm Fresh',      bg: 'from-red-900/40 to-red-800/20'       },
              { emoji: '🔪', label: 'Freshly Cut',     bg: 'from-orange-900/40 to-orange-800/20' },
              { emoji: '🧹', label: 'Hygiene Cleaned', bg: 'from-green-900/40 to-green-800/20'   },
              { emoji: '🛵', label: 'Fast Delivery',   bg: 'from-blue-900/40 to-blue-800/20'     },
            ].map(({ emoji, label, bg }) => (
              <div
                key={label}
                className={`bg-gradient-to-br ${bg} border border-white/10 rounded-2xl flex flex-col items-center justify-center py-10 gap-3`}
              >
                <span className="text-5xl">{emoji}</span>
                <span className="text-sm font-semibold text-white/80">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-center mb-4">
              <span className="text-3xl">😩</span>
              <h3 className="font-poppins font-bold text-lg mt-2 text-gray-300">Without Sunday Chicken</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[
                '😓 Wake up early on Sunday',
                '☀️ Stand in hot sun',
                '⏳ Wait in long queue',
                '🪰 Flies in open shop',
                '💸 Waste time and energy',
                '🏠 Walk back home sweating',
              ].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>

          <div className="bg-primary/20 border border-primary/40 rounded-2xl p-6">
            <div className="text-center mb-4">
              <span className="text-3xl">😎</span>
              <h3 className="font-poppins font-bold text-lg mt-2 text-secondary">With Sunday Chicken</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {[
                '😴 Stay in bed, sleep more',
                '📱 Order in 30 seconds',
                '🏠 Relax at home in AC',
                '✅ Hygienic sealed packing',
                '💰 Same market price',
                '🍗 Fresh chicken at your door',
              ].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-5 text-lg">So why are you still reading? 😄</p>
          <button
            onClick={onOrder}
            className="bg-primary text-white font-poppins font-bold text-lg py-4 px-10 rounded-button shadow-button hover:bg-red-700 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            Order Now — Stay Lazy 😴🍗
          </button>
          <p className="mt-4 text-xs text-gray-500">
            Fresh · Hygienic · Doorstep Delivery · Sivakasi Only
          </p>
        </motion.div>
      </div>
    </section>
  );
}
