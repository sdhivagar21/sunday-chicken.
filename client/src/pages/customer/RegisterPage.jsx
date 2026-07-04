import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Lock } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/constants';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2)             e.name     = 'Name must be at least 2 characters';
    if (!form.phone.match(/^[6-9]\d{9}$/))       e.phone    = 'Enter a valid 10-digit Indian mobile number';
    if (form.password.length < 6)                e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)           e.confirm  = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, phone: form.phone, password: form.password });
      toast.success('Account created! Welcome to Sunday Chicken 🐔');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐔</div>
          <h1 className="font-poppins font-bold text-2xl text-accent">{APP_NAME}</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Your full name" icon={<User size={15} />}
            value={form.name} onChange={set('name')} error={errors.name} required />
          <Input label="Phone Number" type="tel" placeholder="10-digit mobile number" icon={<Phone size={15} />}
            value={form.phone} onChange={set('phone')} error={errors.phone} maxLength={10} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" icon={<Lock size={15} />}
            value={form.password} onChange={set('password')} error={errors.password} required />
          <Input label="Confirm Password" type="password" placeholder="Re-enter password" icon={<Lock size={15} />}
            value={form.confirm} onChange={set('confirm')} error={errors.confirm} required />

          <Button type="submit" size="full" loading={loading} className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
