import { X } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  
  export const Modal = ({ isOpen, onClose, title, children }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-strong rounded-2xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{title}</h3>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };