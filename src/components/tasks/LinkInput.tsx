"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface LinkInputProps {
  onAdd: (link: { title: string; url: string }) => void;
  // Added to allow external control of showing the form
  showAddForm?: boolean;
  onToggleAddForm?: (show: boolean) => void;
  // Added to handle disabling when parent form is saving
  disabled?: boolean;
}

export const LinkInput = ({
  onAdd,
  showAddForm,
  onToggleAddForm,
  disabled,
}: LinkInputProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  // Internal state for showForm if not controlled by parent
  const [internalShowForm, setInternalShowForm] = useState(false);

  const isFormVisible =
    showAddForm !== undefined ? showAddForm : internalShowForm;

  const handleToggle = () => {
    const newState = !isFormVisible;
    if (onToggleAddForm) {
      onToggleAddForm(newState);
    } else {
      setInternalShowForm(newState);
    }
    if (!newState) {
      // If hiding the form, clear its content
      setTitle("");
      setUrl("");
    }
  };

  const handleAddLink = () => {
    if (title.trim() && url.trim()) {
      onAdd({ title, url });
      setTitle("");
      setUrl("");
      handleToggle(); // Close form after adding
    }
  };

  if (!isFormVisible) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-2 px-4 text-sm text-slate-400 transition hover:border-primary-500/50 hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={16} /> Add Link
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleToggle}
          className="text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Link Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
      />
      <input
        type="url"
        placeholder="URL (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleAddLink}
        disabled={disabled || !title.trim() || !url.trim()}
        className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Link
      </button>
    </div>
  );
};
