'use client';

import { Link as LinkIcon, Trash2, Copy } from 'lucide-react';
import { useState } from 'react';

interface Link {
  _id?: string;
  title: string;
  url: string;
}

interface LinkListProps {
  links: Link[];
  onRemove?: (index: number) => void;
  readOnly?: boolean;
}

export const LinkList = ({ links, onRemove, readOnly }: LinkListProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (links.length === 0) return null;

  const handleCopy = (url: string, index: number) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. (Browser security restriction?)');
      });
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy link. Please copy manually or use HTTPS.');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {links.map((link, index) => (
        <div key={link._id || index} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 overflow-hidden text-sm text-white hover:text-rose-400"
            title={link.url}
          >
            <LinkIcon size={20} className="shrink-0" />
            <p className="truncate font-medium">{link.title}</p>
          </a>
          
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleCopy(link.url, index)}
              className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title={copiedIndex === index ? "Copied!" : "Copy Link"}
            >
              {copiedIndex === index ? (
                <span className="text-xs text-green-400">Copied!</span>
              ) : (
                <Copy size={16} />
              )}
            </button>

            {!readOnly && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="rounded p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
                title="Delete Link"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
