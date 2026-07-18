import { motion } from 'framer-motion';

const REVIEWS = [
  { name: 'Ravi Kumar',    area: 'Sivakasi', rating: 5, text: 'Freshest chicken I have ever had delivered. The custom cut option is a game changer for cooking at home.' },
  { name: 'Priya Meenakshi', area: 'Sivakasi', rating: 5, text: 'Ordered twice this week already! Delivery is quick and the chicken is always clean and perfectly portioned.' },
  { name: 'Karthik S',    area: 'Sivakasi', rating: 5, text: 'Excellent service. They even separated the liver as I asked. Will never go to the market again.' },
];

export default function Testimonials() {
  return (
    <section className="container-app py-14">
      <div className="text-center mb-10">
        <h2 className="section-title">What Sivakasi Says</h2>
        <p className="text-gray-400 text-sm mt-2">Real customers, real reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {REVIEWS.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="bg-white rounded-2xl p-6 shadow-card border border-gray-50"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: r.rating }).map((_, j) => (
                <span key={j} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-5">"{r.text}"</p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{r.name[0]}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-accent">{r.name}</div>
                <div className="text-xs text-gray-400">{r.area}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
