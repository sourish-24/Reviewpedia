import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Reusable LoadingPopup / LoadingPill component.
 * Exact 1:1 reproduction of the original loading pill popup from Map.jsx.
 */
export default function LoadingPopup({
  message,
  children,
  icon,
  spin = true,
  iconSize = 18,
  position = 'top-center',
  fixed = false,
  zIndex = 9999,
  style = {}
}) {
  const content = message || children;
  if (!content) return null;

  const posMode = fixed ? 'fixed' : 'absolute';

  const getPositionStyles = () => {
    switch (position) {
      case 'relative':
      case 'static':
        return { position };
      case 'top-left':
        return { position: posMode, top: 20, left: 20 };
      case 'top-right':
        return { position: posMode, top: 20, right: 20 };
      case 'bottom-center':
        return { position: posMode, bottom: 20, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-left':
        return { position: posMode, bottom: 20, left: 20 };
      case 'bottom-right':
        return { position: posMode, bottom: 20, right: 20 };
      case 'center':
        return { position: posMode, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'top-center':
      default:
        return { position: posMode, top: 20, left: '50%', transform: 'translateX(-50%)' };
    }
  };

  const renderIcon = () => {
    if (icon === false) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    return <RefreshCw className={spin ? 'animate-spin' : ''} size={iconSize} />;
  };

  return (
    <div
      style={{
        ...getPositionStyles(),
        zIndex,
        background: 'var(--panel-bg)',
        padding: '10px 20px',
        borderRadius: 20,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'var(--glass-shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: '1px solid var(--glass-border)',
        fontWeight: 500,
        color: 'var(--primary-color)',
        ...style
      }}
    >
      {renderIcon()}
      {content}
    </div>
  );
}

// Aliases for convenience
export { LoadingPopup as LoadingPill, LoadingPopup as LoadingToast };
