// src/components/NotificationContainer.tsx
import React from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
    }
  };

  const getStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return { background: '#10b981', color: 'white' };
      case 'error':
        return { background: '#ef4444', color: 'white' };
      case 'info':
        return { background: '#3b82f6', color: 'white' };
      case 'warning':
        return { background: '#f59e0b', color: 'white' };
    }
  };

  return (
    <div className="notification-container">
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          width: calc(100vw - 40px);
        }

        .notification {
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .notification::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(0, 0, 0, 0.2);
          animation: progress 5s linear;
        }

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

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .notification-icon {
          flex-shrink: 0;
        }

        .notification-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .notification-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .notification-close:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 640px) {
          .notification-container {
            left: 20px;
            right: 20px;
            max-width: none;
            width: auto;
          }
        }
      `}</style>

      {notifications.map(notification => (
        <div
          key={notification.id}
          className="notification"
          style={getStyles(notification.type)}
        >
          <div className="notification-icon">
            {getIcon(notification.type)}
          </div>
          <div className="notification-message">
            {notification.message}
          </div>
          <button
            className="notification-close"
            onClick={() => onRemove(notification.id)}
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}