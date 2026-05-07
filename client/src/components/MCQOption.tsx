import React from 'react';

type OptionState = 'default' | 'selected' | 'correct' | 'wrong';

interface MCQOptionProps {
  label: string;
  text: string;
  state?: OptionState;
  onClick?: () => void;
  isDisabled?: boolean;
  showIcon?: boolean;
}

const MCQOption: React.FC<MCQOptionProps> = ({
  label,
  text,
  state = 'default',
  onClick,
  isDisabled = false,
  showIcon = true,
}) => {
  const getStyles = () => {
    switch (state) {
      case 'selected':
        return {
          borderColor: 'var(--primary)',
          background: 'var(--primary-glow)',
          color: 'var(--primary)',
        };
      case 'correct':
        return {
          borderColor: 'var(--success)',
          background: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--success)',
        };
      case 'wrong':
        return {
          borderColor: 'var(--error)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
        };
      default:
        return {
          borderColor: 'var(--border-medium)',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        };
    }
  };
  
  const getIcon = () => {
    if (!showIcon) return null;
    switch (state) {
      case 'correct':
        return '✓';
      case 'wrong':
        return '✕';
      default:
        return null;
    }
  };
  
  const styles = getStyles();
  const icon = getIcon();
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        width: '100%',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: `2px solid ${styles.borderColor}`,
        borderRadius: '12px',
        background: styles.background,
        color: styles.color,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && state === 'default' ? 0.6 : 1,
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled && state === 'default') {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.background = 'var(--primary-glow)';
        }
      }}
      onMouseLeave={(e) => {
        if (state === 'default') {
          e.currentTarget.style.borderColor = 'var(--border-medium)';
          e.currentTarget.style.background = 'var(--bg-primary)';
        }
      }}
    >
      {/* Option Label (A, B, C, D) */}
      <span
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '18px',
          background: state === 'default' ? 'var(--bg-tertiary)' : styles.borderColor,
          color: state === 'default' ? 'var(--text-secondary)' : 'white',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      
      {/* Option Text */}
      <span style={{ flex: 1, fontSize: '16px', fontWeight: 500 }}>{text}</span>
      
      {/* Status Icon */}
      {icon && (
        <span
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: styles.borderColor,
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
          }}
        >
          {icon}
        </span>
      )}
    </button>
  );
};

export default MCQOption;
