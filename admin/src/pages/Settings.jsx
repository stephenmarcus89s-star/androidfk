import { useEffect, useState } from 'react';
import { Save, Loader2, Globe, Star, Palette } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiError } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { Card, Input, Button, Skeleton } from '../components/ui';

export default function Settings() {
  const { data, loading, setData } = useApi(() => api.get('/settings').then((r) => r.data));
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm({ ...data.settings });
  }, [data]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: result } = await api.put('/settings', form);
      setData(result);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Settings</h1><Skeleton className="h-4 w-48 mt-2" /></div>
        <Card><Skeleton className="h-96 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-white/40">Global configuration for your MirrorPro instance</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </div>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-400" /> Site
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Site Name" value={form.site_name || ''} onChange={(e) => update('site_name', e.target.value)} />
          <Input label="API Base URL" value={form.api_base_url || ''} onChange={(e) => update('api_base_url', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-accent-400" /> Defaults
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Default Rating" value={form.default_rating || ''} onChange={(e) => update('default_rating', e.target.value)} placeholder="4.8" />
          <Input label="Default Downloads Label" value={form.default_downloads || ''} onChange={(e) => update('default_downloads', e.target.value)} placeholder="124K" />
        </div>
        <p className="text-xs text-white/40 mt-2">
          These defaults apply when an app has no explicit rating/downloads override.
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-accent-400" /> Theme
        </h3>
        <div className="flex gap-3">
          {['dark', 'light'].map((t) => (
            <button
              key={t}
              onClick={() => update('theme', t)}
              className={`flex-1 p-4 rounded-xl border-2 transition ${
                form.theme === t ? 'border-accent-500 bg-accent-500/10' : 'border-bg-600 hover:border-bg-500'
              }`}
            >
              <p className="font-medium capitalize">{t}</p>
              <p className="text-xs text-white/40 mt-1">{t === 'dark' ? 'Default admin theme' : 'Light variant'}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
