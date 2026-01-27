import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info, Undo2 } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
  undoAction?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  withUndo: (title: string, undoAction: () => void, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    const duration = toast.duration || (toast.undoAction ? 8000 : 4000);
    setTimeout(() => removeToast(id), duration);

    return id;
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: "success", title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: "error", title, description, duration: 6000 });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: "info", title, description });
  }, [addToast]);

  const withUndo = useCallback((title: string, undoAction: () => void, description?: string) => {
    addToast({ type: "success", title, description, undoAction, duration: 8000 });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, withUndo }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const handleUndo = () => {
    if (toast.undoAction) {
      toast.undoAction();
      handleClose();
    }
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${bgColors[toast.type]}
        ${isExiting ? "animate-slide-out" : "animate-slide-in"}
      `}
      style={{
        animation: isExiting 
          ? "slideOut 0.2s ease-out forwards" 
          : "slideIn 0.3s ease-out forwards"
      }}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-gray-600 mt-0.5">{toast.description}</p>
        )}
        {toast.undoAction && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
          >
            <Undo2 className="w-3 h-3" />
            Undo
          </button>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Add keyframes to index.css or inline styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);
