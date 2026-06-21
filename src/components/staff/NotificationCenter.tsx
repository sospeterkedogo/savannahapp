import { useNotifications } from '../../lib/useNotifications';
import { FaBell, FaCheck, FaCircle } from 'react-icons/fa6';

export function NotificationCenter() {
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaBell className="text-vaha-gold" />
          <h2 className="font-serif text-xl text-vaha-cream">Notifications</h2>
        </div>
        {unreadCount > 0 ? (
          <span className="border border-vaha-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-vaha-gold">
            {unreadCount} new
          </span>
        ) : null}
      </div>

      <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`group relative border border-white/10 p-3 ${notification.is_read ? 'opacity-50' : 'border-vaha-gold/30 bg-vaha-ink'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{notification.title}</h3>
                <p className="mt-1 text-sm text-vaha-muted">{notification.message}</p>
                <span className="mt-2 block text-[10px] uppercase tracking-widest text-vaha-muted/70">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read ? (
                <button type="button" onClick={() => markAsRead(notification.id)} className="text-vaha-gold opacity-0 transition-opacity group-hover:opacity-100" title="Mark as read">
                  <FaCheck />
                </button>
              ) : null}
            </div>
            {!notification.is_read ? <FaCircle className="absolute -left-1 -top-1 text-[8px] text-vaha-gold" /> : null}
          </div>
        ))}

        {notifications.length === 0 ? <p className="py-6 text-center text-sm text-vaha-muted">No notifications</p> : null}
      </div>
    </div>
  );
}
