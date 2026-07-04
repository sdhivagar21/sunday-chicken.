import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Button, Modal, Input, Textarea, Spinner } from '@/components/ui';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/utils';
import { PROFIT_PERCENTAGE } from '@/constants';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', cost_per_kg: '', category_id: '', is_available: true, is_featured: false };

export default function AdminProductsPage() {
  const { products, loading, setProducts } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', cost_per_kg: p.cost_per_kg, category_id: p.category_id || '', is_available: p.is_available, is_featured: p.is_featured });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.cost_per_kg) { toast.error('Name and cost are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await productService.update(editing.id, form);
        toast.success('Product updated');
      } else {
        await productService.create(form);
        toast.success('Product created');
      }
      setModalOpen(false);
      // Refresh
      productService.getAll().then(res => setProducts(res.data?.products || []));
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      setProducts(p => p.filter(x => x.id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleAvailability = async (product) => {
    try {
      await productService.update(product.id, { is_available: !product.is_available });
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
    } catch { toast.error('Update failed'); }
  };

  const sellingPrice = (cost) => cost ? formatPrice(cost * (1 + PROFIT_PERCENTAGE / 100)) : '—';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-accent">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products</p>
        </div>
        <Button onClick={openAdd} icon={<Plus size={16} />}>Add Product</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-card overflow-hidden"
            >
              {/* Image */}
              <div className="relative bg-gray-50 aspect-video">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🐔</div>
                }
                {!p.is_available && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">Out of stock</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-poppins font-semibold text-sm text-accent mb-0.5">{p.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">Cost: {formatPrice(p.cost_per_kg)}/kg</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-green-600 font-medium">Sell: {sellingPrice(p.cost_per_kg)}/kg</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggleAvailability(p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      p.is_available ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100' : 'border-gray-200 text-gray-400 hover:border-primary'
                    }`}>
                    {p.is_available ? <><Eye size={12} /> Available</> : <><EyeOff size={12} /> Disabled</>}
                  </button>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="md">
        <div className="space-y-4">
          <Input label="Product Name" placeholder="e.g. Whole Chicken" value={form.name} onChange={set('name')} required />
          <Textarea label="Description" placeholder="Brief description…" value={form.description} onChange={set('description')} rows={2} />
          <Input label="Cost per KG (₹)" type="number" placeholder="250" value={form.cost_per_kg} onChange={set('cost_per_kg')} hint={`Selling price: ${sellingPrice(form.cost_per_kg)} /kg (after 10% profit)`} required />

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} className="accent-primary" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="accent-primary" />
              Featured
            </label>
          </div>

          <Button size="full" loading={saving} onClick={handleSave}>
            {editing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
