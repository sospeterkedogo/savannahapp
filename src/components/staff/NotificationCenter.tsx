import React from 'react';
import { useNotifications } from '../../lib/useNotifications';
import { FaBell, FaCheck, FaCircle } from 'react-icons/fa6';

export function NotificationCenter() {
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaBell className="text-luxury-accent" />
          <h2 className="text-2xl font-serif font-bold text-luxury-accent">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-luxury-accent px-2 py-0.5 text-xs font-bold text-black">
            {unreadCount} New
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`group relative rounded-xl border border-white/5 p-4 transition-all ${
              notification.is_read ? 'opacity-50' : 'bg-white/5 border-luxury-accent/20'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-white">{notification.title}</h3>
                <p className="mt-1 text-sm text-white/70">{notification.message}</p>
                <span className="mt-2 block text-[10px] uppercase tracking-wider text-white/30">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-luxury-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mark as read"
                >
                  <FaCheck />
                </button>
              )}
            </div>
            {!notification.is_read && (
              <FaCircle className="absolute -left-1 -top-1 text-[8px] text-luxury-accent" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-8 text-center text-white/30">No notifications</div>
        )}
      </div>
    </div>
  );
}
