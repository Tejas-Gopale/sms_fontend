// src/common/components/GlobalToast.jsx
// Mount ONCE at the top of App.jsx. Listens on toastBus and renders toasts.

import { useEffect, useState, useRef } from "react";
import { subscribeToast } from "../utils/toastBus";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const STYLES = {
  error:   { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-700",   icon: AlertTriangle },
  success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: CheckCircle2 },
  info:    { bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-700",  icon: Info },
};

export default function GlobalToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    return subscribeToast(({ message, type }) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    });
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const s = STYLES[t.type] || STYLES.error;
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2 ${s.bg} ${s.border} ${s.text} border rounded-lg shadow-md px-4 py-3 text-sm`}
          >
            <Icon size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}