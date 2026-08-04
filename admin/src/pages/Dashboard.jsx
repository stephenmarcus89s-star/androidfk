import { Download, Star, HardDrive, AlertTriangle, Clock, Activity, Package } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../lib/api';
import { StatCard, Card, Skeleton, Badge, EmptyState } from '../components/ui';

function formatDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString();
  } catch { return s; }
}

export default function Dashboard() {
  const { data, loading, refetch } = useApi(() => api.get('/stats').then((r) => r.data));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/40">Overview of your update distribution</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}><Skeleton className="h-20 w-full" /></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <EmptyState title="Failed to load stats" description="Try refreshing" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/40">Overview of your update distribution</p>
        </div>
        <button onClick={refetch} className="btn-secondary">Refresh</button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Current Version" value={data.currentVersion} sublabel={`Code ${data.versionCode}`} accent="accent" />
        <StatCard icon={HardDrive} label="APK Size" value={data.apkSize} sublabel={`${data.apkSizeBytes || 0} bytes`} accent="success" />
        <StatCard icon={Download} label="Total Downloads" value={data.totalDownloads} sublabel={data.downloadsLabel} accent="accent" />
        <StatCard icon={Star} label="Rating" value={`${data.rating} ★`} sublabel="Average user rating" accent="warning" />
        <StatCard
          icon={AlertTriangle}
          label="Mandatory Update"
          value={data.mandatoryUpdate ? 'Active' : 'Off'}
          sublabel={data.mandatoryUpdate ? 'Users must update' : 'Optional updates'}
          accent={data.mandatoryUpdate ? 'danger' : 'neutral'}
        />
        <StatCard icon={Clock} label="Last Update" value={data.lastUpdate} sublabel="Latest release date" accent="accent" />
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-400" />
            <h3 className="font-semibold">Recent Downloads</h3>
          </div>
          <Badge color="neutral">{data.totalDownloads} total</Badge>
        </div>
        {data.recentDownloads?.length === 0 ? (
          <EmptyState title="No downloads yet" description="When users download your APK, the activity will appear here." />
        ) : (
          <div className="space-y-2">
            {data.recentDownloads?.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-bg-700/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
                    <Download className="w-4 h-4 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">v{d.version_name || '—'} <span className="text-white/40 text-xs">({d.version_code || '—'})</span></p>
                    <p className="text-xs text-white/40">{formatDate(d.created_at)}</p>
                  </div>
                </div>
                <div className="text-xs text-white/40 font-mono">{(d.ip || '').slice(0, 20)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
