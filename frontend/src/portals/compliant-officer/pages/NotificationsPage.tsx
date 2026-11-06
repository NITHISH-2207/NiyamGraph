import React, { useEffect, useState } from 'react';
import { Bell, Check, ExternalLink, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Notification } from '../types/compliance';
import { StatusBadge } from '../components/common/StatusBadge';

interface NotificationsPageProps {
  onSelectApplication: (id: number) => void;
  onRefreshCount?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onSelectApplication,
  onRefreshCount,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res);
      if (onRefreshCount) onRefreshCount();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-card border border-border p-4.5 flex items-center justify-between shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-navy-900">Regulatory Notifications & Alerts</h3>
          <p className="text-xs text-txt-secondary">
            System updates for committee submissions, conflict detections, and approaching condition deadlines
          </p>
        </div>
        <button
          onClick={fetchNotifs}
          className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
          title="Refresh Notifications"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-navy-800 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-card border border-border p-8 text-center text-xs text-txt-secondary">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-card border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                notif.is_read ? 'border-border opacity-85' : 'border-navy-600/50 ring-1 ring-navy-600/20 bg-slate-50/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-saffron-500 flex-shrink-0" />
                  )}
                  <h4 className="text-xs font-bold text-navy-900">
                    {notif.title}
                  </h4>
                  <StatusBadge status={notif.priority} size="sm" showDot={false} />
                  {notif.application_id_str && (
                    <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-border">
                      {notif.application_id_str}
                    </span>
                  )}
                </div>
                <p className="text-xs text-txt-secondary leading-relaxed pl-4">
                  {notif.description}
                </p>
                <span className="text-[10px] text-slate-400 pl-4 block">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-4 sm:pl-0 flex-shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1.5 rounded-lg border border-border text-slate-600 hover:text-navy-900 hover:bg-slate-100 text-xs flex items-center gap-1"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}
                {notif.application_id && (
                  <button
                    onClick={() => onSelectApplication(notif.application_id!)}
                    className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <span>View Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

