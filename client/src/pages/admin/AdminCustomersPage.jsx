import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Spinner } from '@/components/ui';
import api from '@/services/api';
import { formatDate } from '@/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/admin/customers')
      .then(res  => setCustomers(res.data?.customers || []))
      .catch(()  => {})
      .finally(()=> setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-accent">Customers</h1>
        <p className="text-sm text-gray-400 mt-0.5">{customers.length} registered</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  {['Name', 'Phone', 'Email', 'Joined', 'Orders'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-accent">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-red-50 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{c.order_count ?? 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
