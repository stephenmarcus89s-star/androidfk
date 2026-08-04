import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
      <span className="ml-3 text-white/60 text-sm">Loading…</span>
    </div>
  );
}
