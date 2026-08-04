import { clsx } from 'clsx';

export function Card({ className, children, ...props }) {
  return (
    <div className={clsx('card', className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sublabel, accent = 'accent' }) {
  const accentClass = {
    accent: 'from-accent-500 to-purple-500 text-white',
    success: 'from-emerald-500 to-teal-500 text-white',
    warning: 'from-amber-500 to-orange-500 text-white',
    danger: 'from-red-500 to-rose-500 text-white',
  }[accent] || 'from-accent-500 to-purple-500 text-white';

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sublabel && <p className="text-xs text-white/50 mt-1">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentClass} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Button({ variant = 'primary', className, children, ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };
  return (
    <button className={clsx(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, error, className, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className={clsx('input', error && 'border-danger', className)} {...props} />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea className={clsx('input min-h-[120px] resize-y', className)} {...props} />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      {label && <span className="text-sm font-medium text-white/70">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-accent-600' : 'bg-bg-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card animate-slide-up">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    neutral: 'bg-bg-600 text-white/70 border-bg-500',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx('skeleton h-4', className)} />;
}

export function Spinner({ className }) {
  return (
    <svg className={clsx('animate-spin w-4 h-4', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="w-16 h-16 mx-auto rounded-2xl bg-bg-700 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white/40" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-white/50 mt-1 max-w-sm mx-auto">{description}</p>}
    </div>
  );
}
