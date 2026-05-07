import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
  isPaused?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Timer: React.FC<TimerProps> = ({
  duration,
  onTimeUp,
  onTick,
  isPaused = false,
  size = 'md',
}) => {
  const [remaining, setRemaining] = useState(duration);
  
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setRemaining((prev) => {
        const newValue = prev - 1;
        onTick?.(newValue);
        
        if (newValue <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return newValue;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [duration, isPaused, onTimeUp, onTick]);
  
  useEffect(() => {
    setRemaining(duration);
  }, [duration]);
  
  const percentage = (remaining / duration) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeMap = { sm: 60, md: 80, lg: 100 };
  const svgSize = sizeMap[size];
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  
  const getColor = () => {
    if (percentage > 50) return 'var(--success)';
    if (percentage > 25) return 'var(--warning)';
    return 'var(--error)';
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="timer" style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--border-light)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : '22px',
          fontWeight: 600,
          color: getColor(),
        }}
      >
        {formatTime(remaining)}
      </div>
    </div>
  );
};

export default Timer;
