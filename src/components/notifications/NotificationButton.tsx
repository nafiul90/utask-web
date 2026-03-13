"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Api } from "../../lib/api";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "task_assigned" | "comment_added" | "status_changed" | "general";
  relatedTaskId?: {
    _id: string;
    title: string;
    status: string;
  };
  commentId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  typeCounts: Array<{ _id: string; count: number }>;
  recentNotifications: Notification[];
}

export const NotificationButton = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchStats();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "NEW_NOTIFICATION") {
        console.log("Notification received:", event.data.payload);

        playNotificationSound();
        // update your notification state
        fetchNotifications();
        fetchStats();

        // play sound
      }
    });
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await Api.getNotifications(token, 10, 0, false);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;

    try {
      const data = await Api.getNotificationStats(token);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await Api.markNotificationAsRead(token, notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif,
        ),
      );

      if (stats) {
        setStats({
          ...stats,
          unread: Math.max(0, stats.unread - 1),
        });
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      await Api.markAllNotificationsAsRead(token);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );

      if (stats) {
        setStats({
          ...stats,
          unread: 0,
        });
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!token) return;

    try {
      await Api.deleteNotification(token, notificationId);

      const notificationToDelete = notifications.find(
        (n) => n._id === notificationId,
      );
      const wasUnread = notificationToDelete?.read === false;

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId),
      );

      if (stats) {
        setStats({
          ...stats,
          total: stats.total - 1,
          unread: wasUnread ? Math.max(0, stats.unread - 1) : stats.unread,
        });
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "comment_added":
        return "💬";
      case "status_changed":
        return "🔄";
      default:
        return "📢";
    }
  };
  const getUrl = (type: string, notification: Notification) => {
    switch (type) {
      case "task_assigned":
        return `/tasks/${notification.relatedTaskId?._id}`;
      case "comment_added":
        return `/tasks/${notification.relatedTaskId?._id}?commentId=${notification.commentId}`;
      case "comment_updated":
        return `/tasks/${notification.relatedTaskId?._id}?commentId=${notification.commentId}`;
      case "repply_added":
        return `/tasks/${notification.relatedTaskId?._id}?commentId=${notification.commentId}`;
      case "repply_updated":
        return `/tasks/${notification.relatedTaskId?._id}?commentId=${notification.commentId}`;
      case "status_changed":
        return `/tasks/${notification.relatedTaskId?._id}`;
      default:
        return "📢";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-slate-300" />
        {stats && stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {stats.unread > 9 ? "9+" : stats.unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-70px] md:right-0 top-full mt-2 w-screen md:w-96 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              {stats && (
                <p className="text-sm text-slate-400">
                  {stats.unread} unread of {stats.total}
                </p>
              )}
            </div>
            {stats && stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-white/5 transition-colors ${!notification.read ? "bg-slate-800/50" : ""}`}
                    // onClick={() => window.location.reload()}
                  >
                    <Link href={getUrl(notification.type, notification)}>
                      <div className="flex items-start gap-3">
                        <div className="text-xl mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">
                            {notification.message}
                          </p>
                          {notification.relatedTaskId && (
                            <div className="mt-2 text-xs text-slate-400">
                              Task: {notification.relatedTaskId.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 mt-3">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          <Check size={12} />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-400 transition-colors ml-auto"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-secondary-400 hover:text-primary-300 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
