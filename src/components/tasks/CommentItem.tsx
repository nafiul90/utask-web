"use client";

import { useState } from "react";
import { Api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../Avatar";
import { Delete, DeleteIcon, Edit, Edit2 } from "lucide-react";

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface CommentItemProps {
  token: string;
  taskId: string;
  comment: any;
  onRefresh: () => void;
  isReply?: boolean;
  parentId?: string; // If this is a reply, the parent comment ID
  selectedCommentId?: string;
}

export const CommentItem = ({
  token,
  taskId,
  comment,
  onRefresh,
  isReply = false,
  parentId,
  selectedCommentId,
}: CommentItemProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthor = user?.id === comment.author?._id;
  const canManage = user?.role === "admin" || user?.role === "manager";
  const canEdit = isAuthor || canManage;

  const handleUpdate = async () => {
    try {
      setLoading(true);
      if (isReply && parentId) {
        await Api.updateReply(
          token,
          taskId,
          parentId,
          comment._id,
          editContent,
        );
      } else {
        await Api.updateComment(token, taskId, comment._id, editContent);
      }
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      setLoading(true);
      if (isReply && parentId) {
        await Api.deleteReply(token, taskId, parentId, comment._id);
      } else {
        await Api.deleteComment(token, taskId, comment._id);
      }
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      setLoading(true);
      await Api.replyToComment(token, taskId, comment._id, replyContent);
      setReplyContent("");
      setIsReplying(false);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`group flex gap-3 ${isReply ? "mt-3 pl-8" : "mt-4"}`}>
      <Avatar
        src={comment.author?.profilePicture}
        alt={comment.author?.fullName}
        size={isReply ? 24 : 32}
      />
      <div className="flex-1">
        <div
          className={`rounded-2xl ${isReply ? "bg-white/5" : "bg-white/5 rounded-tl-none"} p-3  ${selectedCommentId == comment._id ? "border border-dashed" : ""}`}
        >
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {comment.author?.fullName}
              </span>
            </div>

            {canEdit && !isEditing && (
              <div className="flex gap-2 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  <DeleteIcon size={15} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
          <span className="text-xs text-slate-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        {/* Actions bar (Reply) */}
        {!isReply && !isEditing && (
          <div className="mt-1 flex gap-4 pl-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Reply
            </button>
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-primary-400 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !replyContent.trim()}
              className="rounded-lg bg-primary-500 px-3 py-1 text-xs font-medium text-white hover:bg-primary-400 disabled:opacity-50"
            >
              Reply
            </button>
          </form>
        )}

        {/* Nested Replies */}
        {comment.replies?.map((reply: any) => (
          <CommentItem
            key={reply._id}
            token={token}
            taskId={taskId}
            comment={reply}
            onRefresh={onRefresh}
            isReply={true}
            parentId={comment._id}
            selectedCommentId={selectedCommentId}
          />
        ))}
      </div>
    </div>
  );
};
