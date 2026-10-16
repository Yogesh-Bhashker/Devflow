import { useEffect, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
}

let pushToast: ((message: string) => void) | null = null;

export function showToast(message: string) {
  pushToast?.(message);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    pushToast = (message: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-gray-900 text-white text-sm px-4 py-3 rounded shadow-lg animate-pulse-once">
          🔔 {t.message}
        </div>
      ))}
    </div>
  );
}