import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

let toastId = 0;

const toasts = [];
const subscribers = [];

export const showToast = (message, type = 'success') => {
  const toast = {
    id: ++toastId,
    message,
    type,
    timestamp: Date.now()
  };
  
  toasts.push(toast);
  subscribers.forEach(callback => callback([...toasts]));
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    removeToast(toast.id);
  }, 3000);
};

const removeToast = (id) => {
  const index = toasts.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    subscribers.forEach(callback => callback([...toasts]));
  }
};

export function ToastContainer() {
  const [toastList, setToastList] = useState([]);

  useEffect(() => {
    const unsubscribe = (newToasts) => {
      setToastList(newToasts);
    };
    
    subscribers.push(unsubscribe);
    
    return () => {
      const index = subscribers.indexOf(unsubscribe);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toastList.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-4 shadow-lg min-w-[300px] max-w-md"
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}