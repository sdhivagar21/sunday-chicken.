import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, ImageIcon } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Button, Modal, Spinner } from '@/components/ui';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/utils';
import { PROFIT_PERCENTAGE } from '@/constants';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', cost_per_kg: '',
  category_id: '', is_available: true, is_featured: false
};

export default function AdminProductsPage() {
  const { products, loading, setProducts } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '',
      cost_per_kg: p.cost_per_kg, category_id: p.category_id || '',
      is_available: p.is_available, is_featured: p.is_featured
    });
    setImageFile(null);
    setImagePreview(p.image_url || null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Upload image to Cloudinary directly from frontend
  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sunday_chicken';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', preset);
    fd.append('folder', 'sunday-chicken/products');

    const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST', body: fd
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed');
    return { url: data.secure_url, public_id: data.public_id };
  };

  const handleSave = async () => {
    if (!form.name || !form.cost_per_kg) { toast.error('Name and cost are required'); return; }
    setSaving(true);
    try {
      let image_url       = editing?.image_url || null;
      let image_public_id = editing?.image_public_id || null;

      if (imageFile) {
        setUploading(true);
        toast.loading('Uploading image…', { id: 'upload' });
        const uploaded  = await uploadToCloudinary(imageFile);
        image_url       = uploaded.url;
        image_public_id = uploaded.public_id;
        toast.dismiss('upload');
        setUploading(false);
      }

      const payload = { ...form, image_url, image_public_id };

      if (editing) {
        await productService.update(editing.id, payload);
        toast.success('Product updated ✅');
      } else {
        await productService.create(payload);
        toast.success('Product created ✅');
      }

      setModalOpen(false);
      const res = await productService.adminGetAll();
      setProducts(res?.data?.products || res?.products || []);
    } catch (err) {
      toast.dismiss('upload');
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
      setUploading(false);
    }
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
      await productService.update(product.id, {
        ...product, is_available: !product.is_available
      });
      setProducts(ps => ps.map(p =>
        p.id === product.id ? { ...p, is_available: !p.is_available } : p
      ));
      toast.success(product.is_available ? 'Marked unavailable' : 'Marked available');
    } catch { toast.error('Update failed'); }
  };

  const sellingPrice = (cost) =>
    cost ? formatPrice(Number(cost) * (1 + PROFIT_PERCENTAGE / 100)) : '—';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100 hover:shadow-card-hover transition-shadow"
            >
              {/* Image area */}
              <div className="relative bg-gray-50 h-48 overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                    <ImageIcon size={40} />
                    <span className="text-xs">No image</span>
                  </div>
                )}
                {!p.is_available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
                {p.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⭐ Featured
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-poppins font-semibold text-sm text-accent mb-1 line-clamp-1">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl p-2.5">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400">Cost/kg</p>
                    <p className="text-sm font-bold text-accent">{formatPrice(p.cost_per_kg)}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-400">Sell/kg</p>
                    <p className="text-sm font-bold text-green-600">{sellingPrice(p.cost_per_kg)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(p)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      p.is_available
                        ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {p.is_available ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all text-xs font-medium"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit: ${editing.name}` : 'Add New Product'}
        size="lg"
      >
        <div className="space-y-5">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              id="img-upload"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 h-52">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition"
                >
                  <X size={14} />
                </button>
                <label
                  htmlFor="img-upload"
                  className="absolute bottom-2 right-2 bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-gray-100 transition flex items-center gap-1.5 shadow"
                >
                  <Upload size={12} /> Change
                </label>
              </div>
            ) : (
              <label
                htmlFor="img-upload"
                className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-primary hover:bg-red-50 transition-all group"
              >
                <Upload size={28} className="text-gray-300 group-hover:text-primary mb-2 transition" />
                <p className="text-sm font-medium text-gray-400 group-hover:text-primary">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP · Max 5MB</p>
              </label>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Fresh Whole Chicken"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Brief product description…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 transition resize-none"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cost per KG (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.cost_per_kg}
              onChange={set('cost_per_kg')}
              placeholder="250"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-red-100 transition"
            />
            {form.cost_per_kg && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                ✅ Customer sees: {sellingPrice(form.cost_per_kg)} /kg (after 10% profit)
              </p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-gray-700 font-medium">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-gray-700 font-medium">Featured on Home</span>
            </label>
          </div>

          <Button size="full" loading={saving || uploading} onClick={handleSave}>
            {uploading ? 'Uploading Image…' : saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
