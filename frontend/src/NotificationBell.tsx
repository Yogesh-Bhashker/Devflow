import { useEffect, useState } from "react";
import { api } from "./api";
import { socket, useNotificationSocket, type AppNotification } from "./useSocket";
import { showToast } from "./Toast";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = async () => {
    try {
      const data = await api<AppNotification[]>("/notifications");
      setNotifications(data);
    } catch {
      // bell khali rahega
    }
  };

  useEffect(() => {
    load();
    socket.on("connect", load); // disconnect ke dauraan jo miss hua, wapas laao
    return () => {
      socket.off("connect", load);
    };
  }, []);

  useNotificationSocket((n) => {
    setNotifications((prev) => [n, ...prev]);
    showToast(n.message);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: number) => {
    await api(`/notifications/${id}/read`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await api("/notifications/read-all", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-xl" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`px-3 py-2 text-sm border-b cursor-pointer hover:bg-gray-50 ${
                  n.read ? "text-gray-500" : "text-gray-900 font-medium bg-blue-50"
                }`}
              >
                {n.message}
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}