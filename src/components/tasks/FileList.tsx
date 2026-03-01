'use client';

import { FileText, Trash2, Download, Eye } from 'lucide-react';
import Image from 'next/image';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9052/api';
const assetHost = apiBase.replace(/\/api$/, '');

interface Attachment {
  path: string;
  filename: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
}

interface FileListProps {
  files: Attachment[];
  onRemove?: (index: number) => void;
  readOnly?: boolean;
}

export const FileList = ({ files, onRemove, readOnly }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 mt-2">
      {files.map((file, index) => {
        const isImage = file.mimeType?.startsWith('image/');
        const fileUrl = `${assetHost}${file.path}`;

        return (
          <div key={index} className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 overflow-hidden transition hover:bg-white/10">
            {/* Thumbnail / Icon */}
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/20 border border-white/5">
              {isImage ? (
                <Image 
                  src={fileUrl} 
                  alt={file.originalName || 'Image'} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="text-rose-400" size={24} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white" title={file.originalName}>{file.originalName || file.filename}</p>
              <p className="text-xs text-slate-500">{(file.size ? file.size / 1024 : 0).toFixed(1)} KB</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title={isImage ? "Preview" : "Download"}
              >
                {isImage ? <Eye size={16} /> : <Download size={16} /> }
              </a>
              
              {!readOnly && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
