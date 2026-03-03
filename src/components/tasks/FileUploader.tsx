'use client';

import { ChangeEvent, useState } from 'react';
import { Api } from '../../lib/api';

interface FileUploaderProps {
  token: string;
  onUpload: (file: any) => void;
  disabled?: boolean;
}

export const FileUploader = ({ token, onUpload, disabled }: FileUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploaded = await Api.uploadFile(token, file);
      onUpload(uploaded);
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        accept="image/*,application/pdf,audio/mp3,audio/mpeg"
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <div className={`flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 py-4 text-sm text-slate-400 transition hover:border-rose-500/50 hover:text-rose-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {uploading ? 'Uploading...' : 'Click or drag file to attach (Image/PDF)'}
      </div>
    </div>
  );
};
