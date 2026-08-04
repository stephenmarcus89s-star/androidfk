import { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Dropzone({
  onUpload,
  accept = '*/*',
  multiple = false,
  label = 'Drag & drop files here',
  hint = 'or click to browse',
  disabled = false,
  uploading = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    if (multiple) {
      onUpload(arr);
    } else {
      onUpload(arr[0]);
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={clsx(
        'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
        dragging ? 'border-accent-500 bg-accent-500/5' : 'border-bg-600 hover:border-bg-500 hover:bg-bg-700/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-accent-400 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6 text-accent-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-white">{uploading ? 'Uploading...' : label}</p>
          <p className="text-sm text-white/40 mt-0.5">{hint}</p>
        </div>
      </div>
    </div>
  );
}
