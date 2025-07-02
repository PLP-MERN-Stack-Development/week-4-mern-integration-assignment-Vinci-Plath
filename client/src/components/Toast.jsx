import { useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const ICONS = {
  success: <FiCheckCircle className="text-green-500" />,
  error: <FiAlertCircle className="text-red-500" />,
  info: <FiInfo className="text-blue-500" />,
  warning: <FiAlertTriangle className="text-yellow-500" />
};

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200'
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800'
  }[type];

  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg max-w-xs ${bgColor} ${textColor} flex items-start gap-3 z-50 animate-fadeIn`}
      role="alert"
    >
      <div className="text-xl">
        {ICONS[type] || ICONS.info}
      </div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Close"
      >
        <FiX />
      </button>
    </div>
  );
};

export default Toast;
