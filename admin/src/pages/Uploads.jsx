import { useState } from 'react';
import { UploadCloud, File, Trash2, Loader2, Package, Calendar, Hash, FileText } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiError } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { Card, Button, Input, Textarea, Badge, Skeleton, EmptyState } from '../components/ui';
import Dropzone from '../components/ui/Dropzone';

export default function Uploads() {
  const { data, loading, refetch, setData } = useApi(() => api.get('/app').then((r) => r.data));
  const [form, setForm] = useState({
    version_name: '',
    version_code: '',
    release_date: new Date().toISOString().slice(0, 10),
    changelog: '- Bug fixes\n- Performance improvements\n- New UI improvements',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apkFile, setApkFile] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const MAX_APK_MB = 100;

  const handleApkSelect = (file) => {
    // Client-side size check — fail fast before wasting bandwidth
    if (file.size > MAX_APK_MB * 1024 * 1024) {
      toast.error(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — max allowed is ${MAX_APK_MB} MB`);
      return;
    }
    // Verify .apk extension
    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast.error('Only .apk files are allowed');
      return;
    }
    setApkFile(file);
    // Auto-fill version_name from filename if empty
    if (!form.version_name) {
      const name = file.name.replace(/\.apk$/i, '').replace(/[-_]/g, '.');
      update('version_name', name);
    }
  };

  const handleUploadApk = async () => {
    if (!apkFile) {
      toast.error('Please select an APK file first');
      return;
    }
    if (!form.version_name || !form.version_code || !form.release_date) {
      toast.error('Version name, code, and release date are required');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('apk', apkFile);
      fd.append('version_name', form.version_name);
      fd.append('version_code', String(form.version_code));
      fd.append('release_date', form.release_date);
      fd.append('changelog', form.changelog);

      const { data: result } = await api.post('/upload-apk', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      setData((d) => ({ ...d, versions: [result.version, ...(d.versions || [])], latestVersion: result.version }));
      setApkFile(null);
      setForm((f) => ({ ...f, version_name: '', version_code: '' }));
      toast.success(`Version ${result.version.version_name} uploaded`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteVersion = async (id) => {
    if (!confirm('Delete this version? The APK file will be removed.')) return;
    try {
      await api.delete(`/version/${id}`);
      setData((d) => ({ ...d, versions: d.versions.filter((v) => v.id !== id) }));
      toast.success('Version deleted');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Uploads</h1><Skeleton className="h-4 w-48 mt-2" /></div>
        <Card><Skeleton className="h-96 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Uploads</h1>
        <p className="text-white/40">Upload a new APK version — it becomes the latest release instantly</p>
      </div>

      {/* New version form */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-accent-400" /> Publish New Version
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input label="Version Name" value={form.version_name} onChange={(e) => update('version_name', e.target.value)} placeholder="2.5.0" />
          <Input label="Version Code (integer)" type="number" value={form.version_code} onChange={(e) => update('version_code', e.target.value)} placeholder="25" />
          <Input label="Release Date" type="date" value={form.release_date} onChange={(e) => update('release_date', e.target.value)} />
        </div>

        <div className="mb-4">
          <Textarea
            label="Changelog (one item per line, optional Markdown)"
            value={form.changelog}
            onChange={(e) => update('changelog', e.target.value)}
            rows={6}
            placeholder={'- Bug fixes\n- Performance improvements\n- New feature: ...'}
          />
        </div>

        {/* APK selection */}
        <div className="mb-4">
          {apkFile ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-bg-700 border border-bg-600">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-accent-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{apkFile.name}</p>
                  <p className="text-xs text-white/40">{(apkFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setApkFile(null)} className="btn-ghost">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Dropzone
              onUpload={handleApkSelect}
              accept="application/vnd.android.package-archive,.apk"
              label="Select APK file"
              hint=".apk files only — max 100 MB"
            />
          )}
        </div>

        {uploading && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-bg-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-500 to-purple-500 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <Button onClick={handleUploadApk} disabled={uploading || !apkFile}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          Publish Version
        </Button>
      </Card>

      {/* Versions list */}
      <Card>
        <h3 className="font-semibold mb-4">Version History</h3>
        {data.versions?.length === 0 ? (
          <EmptyState icon={Package} title="No versions yet" description="Upload your first APK above to publish a version." />
        ) : (
          <div className="space-y-3">
            {data.versions?.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-700/50 border border-bg-600 hover:border-bg-500 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-accent-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">v{v.version_name}</p>
                      {v.is_latest && <Badge color="success">Latest</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mt-0.5">
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{v.version_code}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{v.release_date}</span>
                      <span className="flex items-center gap-1"><File className="w-3 h-3" />{v.apk_size_text}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={v.apk_url} target="_blank" rel="noreferrer" className="btn-ghost">
                    <FileText className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDeleteVersion(v.id)} className="btn-danger px-2.5 py-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
