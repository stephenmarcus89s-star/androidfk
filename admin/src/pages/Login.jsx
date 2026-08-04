import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiError } from '../lib/api';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@mirrorpro.app');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/login', { email, password });
      setAuth(data.token, data.admin);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-purple-500 items-center justify-center shadow-glow mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">MirrorPro</h1>
          <p className="text-white/40 mt-1">Admin Console</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="admin@mirrorpro.app"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>

          <div className="text-xs text-white/40 text-center pt-2 border-t border-bg-600">
            <p>Default credentials</p>
            <p className="font-mono mt-1 text-white/60">admin@mirrorpro.app / MirrorPro@2026!</p>
          </div>
        </form>
      </div>
    </div>
  );
}
