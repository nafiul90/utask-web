'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../lib/api';

const VAPID_PUBLIC_KEY = 'BAxLK2VC7ssha4Iin28xbZrPx7eeW6_rRSK0Zevupi5Gh7QUyxwZCEuyzzzh-F6wOf7jCqQWMh7PIQ_Bgo28Ft4';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  relatedTaskId?: { _id: string; title: string; status: string };
  read: boolean;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
}

export const NotificationButton = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    if (token) {
      fetchNotifications();
      fetchStats();
      initPush();
    }
  }, [token]);

  const initPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY
        });
        await Api.post('/subscribe', { subscription: sub }, token);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await Api.getNotifications(token!, 10, 0, false);
      setNotifications(data.notifications || []);
      if (data.notifications.some(n => !n.read)) {
        audioRef.current?.play();
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await Api.getNotificationStats(token!);
      setStats(data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  // original handleMarkAsRead, markAll, delete, getIcon, formatTime...

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => {
  setIsOpen(!isOpen);
  if (stats?.unread > 0) {
    audioRef.current?.play().catch(e => console.log('Autoplay prevented'));
  }
}} className="p-2 rounded-full hover:bg-white/10">
        <Bell size={20} />
        {stats?.unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4">{stats.unread}</span>}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-lg z-50">
          {/* original dropdown list */}
          <div className="p-4">
            Enable Push Notifications (on load auto-prompt)
          </div>
        </div>
      )}
    </div>
  );
};
