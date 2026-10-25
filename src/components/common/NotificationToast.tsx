import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationToast: React.FC = () => {
  const { activeNotification, dismissNotification } = useApp();

  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      dismissNotification();
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeNotification, dismissNotification]);

  if (!activeNotification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-800 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-stone-100">{activeNotification}</p>
        </div>
        <button
          onClick={dismissNotification}
          className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
