"use client";

import useSWR from "swr";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { Api } from "../lib/api";

interface CommentReply {
  _id: string;
  content: string;
  author: {
    fullName: string;
    profilePicture: string;
  };
  createdAt: string;
}

interface Comment {
  taskId: string;
  taskTitle: string;
  comment: {
    _id: string;
    content: string;
    author: {
      fullName: string;
      profilePicture: string;
    };
    createdAt: string;
    replies: CommentReply[];
  };
}

const RecentComments = () => {
  const { token } = useAuth();

  const { data: comments, error } = useSWR<Comment[]>(
    token ? "recent-comments" : null,
    () => Api.getRecentComments(token!),
  );

  if (error)
    return (
      <div className="text-primary-400 p-4 rounded">Error loading comments</div>
    );
  if (!comments)
    return <div className="text-slate-400 p-4 rounded">Loading...</div>;
  if (!comments || comments.length === 0)
    return <div className="text-slate-500 italic p-4">No recent comments</div>;

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {comments.map((item) => (
        <div
          key={item.comment._id}
          className="border-l-4 border-primary-500 pl-4 bg-slate-900/30 p-3 rounded-lg bg-white/5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/tasks/${item.taskId}?commentId=${item.comment._id}`}
              className="font-semibold text-secondary-500 hover:text-primary-300 text-sm truncate"
            >
              {item.taskTitle}
            </Link>
            <span className="text-xs text-slate-500 ml-auto">
              {new Date(item.comment.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2 mb-2">
            <Avatar
              src={item.comment.author.profilePicture}
              alt={item.comment.author.fullName}
              size={24}
            />
            <Link href={`/tasks/${item.taskId}?commentId=${item.comment._id}`}>
              <p className="text-sm flex-1">{item.comment.content}</p>
            </Link>
          </div>
          {item.comment.replies && item.comment.replies.length > 0 && (
            <div className="ml-6 space-y-1 border-l border-slate-700 pl-3">
              {item.comment.replies.map((reply, i) => (
                <Link
                  key={i}
                  href={`/tasks/${item.taskId}?commentId=${reply._id}`}
                >
                  <div key={i} className="flex gap-2 text-xs py-1">
                    <Avatar
                      src={reply.author.profilePicture}
                      alt={reply.author.fullName}
                      size={20}
                    />
                    <span className="flex-1">{reply.content}</span>
                    <span className="text-slate-500 whitespace-nowrap">
                      {new Date(reply.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentComments;
