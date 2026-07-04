import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🌿', title: 'Farm Fresh',        desc: 'Sourced daily from local farms. No frozen, no preservatives.'  },
  { icon: '🧹', title: 'Hygiene First',     desc: 'Cleaned and cut in a sanitised environment every single day.'  },
  { icon: '⚡', title: 'Fast Delivery',     desc: 'From our shop to your door — typically under 45 minutes.'       },
  { icon: '✂️', title: 'Custom Cuts',       desc: 'Small, medium, curry cut — your preference, our priority.'     },
  { icon: '💰', title: 'Honest Pricing',    desc: 'Transparent pricing with no hidden charges, ever.'              },
  { icon: '📞', title: '24/7 Support',      desc: 'Questions? Reach us anytime via phone or WhatsApp.'            },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gray-50 py-14">
      <div className="container-app">
        <div className="text-center mb-10">
          <h2 className="section-title">Why Sunday Chicken?</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            We've built our business on quality, speed, and trust — and Sivakasi has noticed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow group"
            >
              <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 transition-colors rounded-xl flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-poppins font-semibold text-base text-accent mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
