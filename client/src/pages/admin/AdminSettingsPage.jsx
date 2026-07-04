import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ delivery_charge: '30', profit_percentage: '10', store_status: 'open' });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(res => {
      if (res.data) setSettings(s => ({ ...s, ...res.data }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-accent">Settings</h1>
      </div>

      <div className="max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
        <Input label="Delivery Charge (₹)" type="number" value={settings.delivery_charge}
          onChange={e => setSettings(s => ({ ...s, delivery_charge: e.target.value }))} />
        <Input label="Profit Percentage (%)" type="number" value={settings.profit_percentage}
          onChange={e => setSettings(s => ({ ...s, profit_percentage: e.target.value }))} />

        <div>
          <label className="block text-sm font-medium text-accent mb-1.5">Store Status</label>
          <select value={settings.store_status}
            onChange={e => setSettings(s => ({ ...s, store_status: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="open">Open — accepting orders</option>
            <option value="closed">Closed — not accepting orders</option>
          </select>
        </div>

        <Button size="full" loading={saving} onClick={handleSave}>Save Settings</Button>
      </div>
    </AdminLayout>
  );
}
