import React from 'react';

interface ScoreBoardProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  streak?: number;
  timeBonus?: number;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  streak = 0,
  timeBonus = 0,
  size = 'md',
}) => {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const sizeMap = {
    sm: { padding: '12px 16px', gap: '12px', scoreSize: '24px' },
    md: { padding: '16px 24px', gap: '16px', scoreSize: '32px' },
    lg: { padding: '24px 32px', gap: '24px', scoreSize: '48px' },
  };
  
  const styles = sizeMap[size];
  
  const getGrade = () => {
    if (percentage >= 90) return { label: 'Excellent!', color: 'var(--success)' };
    if (percentage >= 70) return { label: 'Good Job!', color: 'var(--info)' };
    if (percentage >= 50) return { label: 'Keep Going!', color: 'var(--warning)' };
    return { label: 'Try Again!', color: 'var(--error)' };
  };
  
  const grade = getGrade();
  
  return (
    <div
      className="scoreboard card"
      style={{
        padding: styles.padding,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.gap,
        }}
      >
        {/* Score Circle */}
        <div
          style={{
            width: size === 'lg' ? 120 : size === 'md' ? 100 : 80,
            height: size === 'lg' ? 120 : size === 'md' ? 100 : 80,
            borderRadius: '50%',
            background: `conic-gradient(${grade.color} ${percentage}%, var(--bg-tertiary) 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: styles.scoreSize,
                fontWeight: 700,
                color: grade.color,
              }}
            >
              {score}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>points</span>
          </div>
        </div>
        
        {/* Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '12px' }}>
            <span
              style={{
                fontSize: size === 'lg' ? '24px' : '18px',
                fontWeight: 600,
                color: grade.color,
              }}
            >
              {grade.label}
            </span>
          </div>
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            <StatItem label="Correct" value={`${correctAnswers}/${totalQuestions}`} />
            <StatItem label="Accuracy" value={`${percentage}%`} />
            {streak > 0 && <StatItem label="Streak" value={`${streak}🔥`} />}
            {timeBonus > 0 && <StatItem label="Time Bonus" value={`+${timeBonus}`} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      padding: '8px 12px',
      background: 'var(--bg-tertiary)',
      borderRadius: '8px',
    }}
  >
    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
      {value}
    </div>
  </div>
);

export default ScoreBoard;
