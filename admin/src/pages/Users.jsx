import { useState } from 'react';
import { User, Mail, Lock, Save, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiError } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Card, Input, Button } from '../components/ui';

export default function Users() {
  const admin = useAuthStore((s) => s.admin);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [profile, setProfile] = useState({ name: admin?.name || '', email: admin?.email || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const { data } = await api.put('/me/profile', profile);
      setAuth(useAuthStore.getState().token, data.admin);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwords.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/me/password', passwords);
      setPasswords({ current_password: '', new_password: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-white/40">Manage your admin profile and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-accent-400" /> Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className="pl-10" />
              </div>
            </div>
            <Button onClick={handleProfileSave} disabled={savingProfile}>
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </Button>
          </div>
        </Card>

        {/* Password */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent-400" /> Change Password
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <Input type="password" value={passwords.current_password} onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label className="label">New Password</label>
              <Input type="password" value={passwords.new_password} onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))} placeholder="••••••••" />
            </div>
            <Button onClick={handlePasswordSave} disabled={savingPassword}>
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
