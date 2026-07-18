import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Spinner } from '@/components/ui';
import { reportService } from '@/services/report.service';
import { formatPrice } from '@/utils';

export default function AdminReportsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('daily');

  useEffect(() => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    reportService.daily(today)
      .then(res  => setData(res.data))
      .catch(()  => {})
      .finally(()=> setLoading(false));
  }, [period]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-accent">Reports</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {['daily', 'weekly', 'monthly'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all capitalize ${
              period === p ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'
            }`}>
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders',   value: data?.total_orders ?? '—'  },
            { label: 'Total Revenue',  value: data?.total_revenue ? formatPrice(data.total_revenue) : '—' },
            { label: 'Avg Order',      value: data?.avg_order ? formatPrice(data.avg_order) : '—' },
            { label: 'Items Sold',     value: data?.items_sold ?? '—'    },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5">
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              <p className="font-poppins font-bold text-xl text-accent mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
