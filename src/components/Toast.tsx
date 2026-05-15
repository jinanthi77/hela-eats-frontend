import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Hook ────────────────────────────────────────────────────────────
export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Toast Container ───────────────────────────────────── */}
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ─── Individual Toast ────────────────────────────────────────────────
const iconMap = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-sky-500 flex-shrink-0" />,
};

const bgMap = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-sky-50 border-sky-200',
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => (
  <div
    className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm 
      w-full sm:min-w-[300px] sm:max-w-[420px] animate-[slideInRight_0.3s_ease] ${bgMap[toast.type]}`}
    role="alert"
  >
    {iconMap[toast.type]}
    <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{toast.message}</p>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      aria-label="Dismiss"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default ToastProvider;
