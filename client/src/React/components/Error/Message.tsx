import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import '@css/LandingPageStyle.css';

interface MessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
  icon?: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({
  message,
  type = 'error',
  onClose,
  icon
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 500); // Call onClose after exit animation
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Define colors based on message type
  const colors = {
    error: { bg: '#ffe0e0', border: '#ff5c5c', text: '#d32f2f' },
    warning: { bg: '#fff8e1', border: '#ffb74d', text: '#f57c00' },
    info: { bg: '#e3f2fd', border: '#64b5f6', text: '#1976d2' },
    success: { bg: '#e8f5e9', border: '#81c784', text: '#388e3c' },
  };

  const selectedColors = colors[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="message-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            x: isShaking ? [-5, 5, -5, 5, 0] : 0
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '15px 20px',
            borderRadius: '8px',
            backgroundColor: selectedColors.bg,
            border: `2px solid ${selectedColors.border}`,
            color: selectedColors.text,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            margin: '15px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '600px',
            position: 'relative'
          }}
          onClick={triggerShake}
        >
          <motion.div
            className="message-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {icon ? (
              icon
            ) : (
              <motion.div
                animate={{ rotate: isShaking ? [0, 15, -15, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {type === 'error' && <span style={{ fontSize: '22px' }}>⚠️</span>}
                {type === 'warning' && <span style={{ fontSize: '22px' }}>⚡</span>}
                {type === 'info' && <span style={{ fontSize: '22px' }}>ℹ️</span>}
                {type === 'success' && <span style={{ fontSize: '22px' }}>✅</span>}
              </motion.div>
            )}

            <div>
              <p style={{
                margin: 0,
                fontWeight: 500,
                fontSize: '16px'
              }}>
                {message}
              </p>
            </div>
          </motion.div>

          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: selectedColors.text,
                padding: '5px',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              ✖
            </motion.button>
          )}

          <motion.div
            className="message-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '8px',
              border: `2px solid ${selectedColors.border}`,
              pointerEvents: 'none',
              zIndex: -1
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Message;