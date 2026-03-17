"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { Api } from "../../lib/api";
import { FileUploader } from "./FileUploader";
import { FileList } from "./FileList";
import { LinkInput } from "./LinkInput";
import { AudioRecorder } from "../audio/AudioRecorder";
import { LinkList } from "./LinkList";

type User = { id: string; fullName: string };

interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  phoneToNotify: string;
}

interface TaskFormModalProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  phoneToNotify: string;
}

export const TaskFormModal = ({
  token,
  onClose,
  onSuccess,
  phoneToNotify,
}: TaskFormModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>();
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false); // State to control LinkInput form visibility
  const { data: users } = useSWR(["users", token], ([_, t]) =>
    Api.listUsers(t),
  );

  const onSubmit = async (data: TaskFormData) => {
    try {
      setSaving(true);
      await Api.createTask(token, {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        attachments,
        links,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (phoneToNotify) {
      reset({
        phoneToNotify,
      });
    }
  }, [phoneToNotify]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm text-slate-300">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-primary-400 focus:outline-none"
              placeholder="Task title"
            />
            {errors.title && (
              <p className="text-xs text-primary-400 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Assignee
              </label>
              <select
                {...register("assignee")}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-white focus:border-primary-400 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {users?.map((u: User) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                {...register("dueDate", { required: "Due date is required" })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-primary-400 focus:outline-none"
              />
              {errors.dueDate && (
                <p className="text-xs text-primary-400 mt-1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-primary-400 focus:outline-none"
              placeholder="Task details..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Attachments
            </label>
            <FileUploader
              token={token}
              onUpload={(file) => setAttachments((prev) => [...prev, file])}
            />
            <FileList files={attachments} onRemove={handleRemoveFile} />
            <div className="mt-6">
              <label className="mb-2 block text-sm text-slate-300 font-medium">
                🎙️ Record Audio Note
              </label>
              <AudioRecorder
                token={token}
                onUpload={(file) => setAttachments((prev) => [...prev, file])}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Links</label>
            <LinkInput
              onAdd={(link) => setLinks((prev) => [...prev, link])}
              showAddForm={showAddLinkForm}
              onToggleAddForm={setShowAddLinkForm}
              disabled={saving} // Disable when parent form is saving
            />
            <LinkList links={links} onRemove={handleRemoveLink} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Phone number to notify
            </label>
            <input
              {...register("phoneToNotify")}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-primary-400 focus:outline-none"
              placeholder="Whatsapp number"
            />
          </div>

          <div className="form-actions flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-white/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-primary-500/30 hover:bg-primary-400 disabled:opacity-60"
              onClick={handleSubmit(onSubmit)}
            >
              {saving ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
