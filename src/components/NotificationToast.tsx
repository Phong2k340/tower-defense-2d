import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { GameEngine } from '../engine/GameEngine';

interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationToastProps {
  engine: GameEngine;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ engine }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = engine.subscribeToast((message, type) => {
      const id = `${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    });

    return unsub;
  }, [engine]);

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="toast-icon-success" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-warning" />;
      case 'error':
        return <XCircle size={18} className="toast-icon-error" />;
      default:
        return <Info size={18} className="toast-icon-info" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-card toast-${t.type} slide-in`}>
          {getIcon(t.type)}
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

