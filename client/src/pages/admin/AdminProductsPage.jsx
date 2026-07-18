import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, ImageIcon } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/utils';
import { PROFIT_PERCENTAGE } from '@/constants';
import toast from 'react-hot-toast';

const EMPTY = {
  name:'', description:'', cost_per_kg:'',
  category_id:'', is_available:true, is_featured:false
};

export default function AdminProductsPage() {
  const { products, loading, setProducts } = useProducts();
  const [open,    setOpen]    = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const fileRef = useRef();

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => {
    setEditing(null); setForm(EMPTY);
    setImgFile(null); setImgPrev(null); setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '',
      cost_per_kg: p.cost_per_kg, category_id: p.category_id || '',
      is_available: p.is_available, is_featured: p.is_featured
    });
    setImgFile(null);
    setImgPrev(p.image_url || null);
    setOpen(true);
  };

  const onPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('Image must be under 8MB'); return; }
    setImgFile(file);
    setImgPrev(URL.createObjectURL(file));
  };

  const clearImg = () => {
    setImgFile(null); setImgPrev(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleSave = async () => {
    if (!form.name.trim())  { toast.error('Product name is required'); return; }
    if (!form.cost_per_kg)  { toast.error('Cost per kg is required');  return; }
    setSaving(true);
    try {
      let payload = { ...form };
      if (imgFile) {
        toast.loading('Uploading image…', { id: 'img' });
        payload.image_base64 = await toBase64(imgFile);
        toast.dismiss('img');
      } else if (imgPrev === null && editing?.image_url) {
        payload.remove_image = true;
      }
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success('Product updated ✅');
      } else {
        await productService.create(payload);
        toast.success('Product added ✅');
      }
      setOpen(false);
      const res = await productService.adminGetAll();
      setProducts(res?.data?.products || res?.products || []);
    } catch (err) {
      toast.dismiss('img');
      toast.error(err?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      setProducts(ps => ps.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleAvail = async (product) => {
    try {
      await productService.update(product.id, { ...product, is_available: !product.is_available });
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
      toast.success(product.is_available ? 'Hidden from store' : 'Now visible');
    } catch { toast.error('Update failed'); }
  };

  const sellPrice = (cost) =>
    cost ? formatPrice(Number(cost) * (1 + PROFIT_PERCENTAGE / 100)) : '—';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-accent">Products</h1>
          <p className="text-sm text-gray-400">{products.length} products</p>
        </div>
        <Button onClick={openAdd} icon={<Plus size={16} />}>Add Product</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
            >
              <div className="relative bg-gray-50 h-48 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                    <ImageIcon size={36} /><span className="text-xs">No image</span>
                  </div>
                )}
                {!p.is_available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">Hidden</span>
                  </div>
                )}
                {p.is_featured && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-accent mb-1 line-clamp-1">{p.name}</h3>
                {p.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2 bg-gray-50 rounded-xl p-2.5 mb-3">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400">Cost/kg</p>
                    <p className="text-sm font-bold text-accent">{formatPrice(p.cost_per_kg)}</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400">Sell/kg</p>
                    <p className="text-sm font-bold text-green-600">{sellPrice(p.cost_per_kg)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAvail(p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all
                      ${p.is_available ? 'border-green-200 text-green-600 bg-green-50' : 'border-gray-200 text-gray-400'}`}
                  >
                    {p.is_available ? <><Eye size={12}/> Live</> : <><EyeOff size={12}/> Hidden</>}
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 size={12}/> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── CUSTOM DRAWER — replaces Modal completely ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer from right */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-poppins font-bold text-lg text-accent">
                  {editing ? `Edit: ${editing.name}` : 'Add New Product'}
                </h2>
                <button onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* ── IMAGE UPLOAD ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Image
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onPick}
                    className="hidden"
                    id="prod-img"
                  />
                  {imgPrev ? (
                    <div className="relative rounded-2xl overflow-hidden h-52 bg-gray-100">
                      <img src={imgPrev} alt="preview" className="w-full h-full object-cover" />
                      <button onClick={clearImg}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5">
                        <X size={14} />
                      </button>
                      <label htmlFor="prod-img"
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow flex items-center gap-2">
                        <Upload size={13} /> Change Photo
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="prod-img"
                      className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary hover:bg-red-50 transition-all group"
                    >
                      <Upload size={32} className="text-gray-300 group-hover:text-primary mb-3" />
                      <p className="text-sm font-semibold text-gray-500 group-hover:text-primary">
                        Click to pick photo from your device
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 8MB</p>
                    </label>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.name} onChange={f('name')}
                    placeholder="e.g. Fresh Whole Chicken"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 transition" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea value={form.description} onChange={f('description')}
                    placeholder="Describe the product…" rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 resize-none transition" />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Cost per KG (₹) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" value={form.cost_per_kg} onChange={f('cost_per_kg')}
                    placeholder="e.g. 250"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 transition" />
                  {form.cost_per_kg && (
                    <p className="text-xs text-green-600 mt-1.5 bg-green-50 rounded-lg px-3 py-1.5 font-medium">
                      ✅ Customer sees: {sellPrice(form.cost_per_kg)} /kg (after 10% profit)
                    </p>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  {[['is_available','Available for sale'],['is_featured','Show on home page']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-red-600" />
                      <span className="text-sm text-gray-700 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Save button */}
              <div className="px-6 py-4 border-t border-gray-100">
                <Button size="full" loading={saving} onClick={handleSave}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
