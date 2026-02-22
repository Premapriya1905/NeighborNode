import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Toast = ({ type = "info", message, onClose, duration = 4000 }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors = {
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  };

  const textColors = {
    success: "text-green-700 dark:text-green-300",
    error: "text-red-700 dark:text-red-300",
    info: "text-blue-700 dark:text-blue-300",
    warning: "text-yellow-700 dark:text-yellow-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className={`flex items-center gap-3 p-4 rounded-lg border ${colors[type]} shadow-lg`}
    >
      <div className={textColors[type]}>{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`${textColors[type]} hover:opacity-70 transition-opacity`}
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default Toast;
