import { useEffect, useState } from 'react';
import { Save, Loader2, RefreshCw, Image as ImageIcon, Trash2, Star, Info } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiError } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { Card, Button, Input, Textarea, Toggle, Badge, Skeleton, EmptyState } from '../components/ui';
import Dropzone from '../components/ui/Dropzone';

export default function ManageApp() {
  const { data, loading, refetch, setData } = useApi(() => api.get('/app').then((r) => r.data));
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  useEffect(() => {
    if (data?.app) {
      setForm({
        name: data.app.name || '',
        developer: data.app.developer || '',
        package_name: data.app.package_name || '',
        description: data.app.description || '',
        min_android: data.app.min_android || '8.0',
        rating_override: data.app.rating_override ?? '',
        downloads_override: data.app.downloads_override ?? '',
        mandatory_update: !!data.app.mandatory_update,
      });
    }
  }, [data]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating_override: form.rating_override === '' ? null : Number(form.rating_override),
        downloads_override: form.downloads_override === '' ? null : form.downloads_override,
      };
      const { data: result } = await api.put('/app', payload);
      setData((d) => ({ ...d, app: result.app }));
      toast.success('App details saved');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const { data: result } = await api.post('/upload-logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setData((d) => ({ ...d, logo: result.logo }));
      toast.success('Logo uploaded');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleScreenshotUpload = async (files) => {
    const arr = Array.isArray(files) ? files : [files];
    if ((data?.screenshots?.length || 0) + arr.length > 10) {
      toast.error('Maximum 10 screenshots allowed');
      return;
    }
    setScreenshotUploading(true);
    try {
      for (const file of arr) {
        const fd = new FormData();
        fd.append('screenshot', file);
        const { data: result } = await api.post('/upload-screenshot', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setData((d) => ({ ...d, screenshots: [...(d.screenshots || []), result.screenshot] }));
      }
      toast.success(`${arr.length} screenshot(s) uploaded`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setScreenshotUploading(false);
    }
  };

  const handleDeleteScreenshot = async (id) => {
    if (!confirm('Delete this screenshot?')) return;
    try {
      await api.delete(`/screenshot/${id}`);
      setData((d) => ({ ...d, screenshots: d.screenshots.filter((s) => s.id !== id) }));
      toast.success('Screenshot removed');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (loading || !form) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage App</h1>
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Card><Skeleton className="h-96 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage App</h1>
          <p className="text-white/40">Edit your app's metadata, logo, and screenshots</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* App metadata */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-accent-400" /> App Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="App Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
          <Input label="Developer" value={form.developer} onChange={(e) => update('developer', e.target.value)} />
          <Input label="Package Name" value={form.package_name} onChange={(e) => update('package_name', e.target.value)} placeholder="com.example.app" />
          <Input label="Minimum Android Version" value={form.min_android} onChange={(e) => update('min_android', e.target.value)} placeholder="8.0" />
          <Input label="Rating Override (optional, 0-5)" type="number" step="0.1" min="0" max="5" value={form.rating_override} onChange={(e) => update('rating_override', e.target.value)} placeholder="Leave empty for default" />
          <Input label="Downloads Override (optional)" value={form.downloads_override} onChange={(e) => update('downloads_override', e.target.value)} placeholder="e.g. 124K" />
        </div>
        <div className="mt-4">
          <Textarea label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="A modern Android application..." rows={6} />
          <p className="text-xs text-white/40 mt-1">Supports Markdown. Use **bold**, *italic*, - bullet, [link](url).</p>
        </div>
        <div className="mt-4 pt-4 border-t border-bg-600">
          <Toggle checked={form.mandatory_update} onChange={(v) => update('mandatory_update', v)} label="Mandatory Update (users cannot skip)" />
        </div>
      </Card>

      {/* Logo */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-accent-400" /> App Logo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center">
            {data.logo ? (
              <div className="w-32 h-32 rounded-2xl bg-bg-700 overflow-hidden flex items-center justify-center">
                <img src={data.logo.url} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-bg-700 border-2 border-dashed border-bg-600 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-white/30" />
              </div>
            )}
            <p className="text-xs text-white/40 mt-2">Current logo</p>
          </div>
          <div className="md:col-span-2">
            <Dropzone
              onUpload={handleLogoUpload}
              accept="image/png,image/jpeg,image/webp"
              label="Upload new logo"
              hint="PNG, JPG, or WEBP — max 10MB"
              uploading={logoUploading}
            />
          </div>
        </div>
      </Card>

      {/* Screenshots */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-accent-400" /> Screenshots
            <Badge color="accent">{data.screenshots?.length || 0} / 10</Badge>
          </h3>
        </div>

        {data.screenshots?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {data.screenshots.map((s) => (
              <div key={s.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-bg-700 border border-bg-600">
                <img src={s.url} alt={s.caption || 'Screenshot'} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeleteScreenshot(s.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-danger/80 hover:bg-danger text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {data.screenshots?.length < 10 && (
          <Dropzone
            onUpload={handleScreenshotUpload}
            accept="image/png,image/jpeg,image/webp"
            multiple
            label="Upload screenshots"
            hint="Drag & drop multiple files — max 10 total"
            uploading={screenshotUploading}
          />
        )}
      </Card>
    </div>
  );
}
