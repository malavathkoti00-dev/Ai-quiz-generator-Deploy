import React from 'react';

interface QuizCardProps {
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  creator?: string;
  createdAt?: string;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
  title,
  category,
  difficulty,
  questionCount,
  creator,
  createdAt,
  onPlay,
  onEdit,
  onDelete,
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy':
        return 'var(--success)';
      case 'Medium':
        return 'var(--warning)';
      case 'Hard':
        return 'var(--error)';
      default:
        return 'var(--text-muted)';
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="card card-interactive" style={{ overflow: 'hidden' }}>
      <div className="card-body" style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span
            className="badge badge-primary"
            style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {category}
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: `${getDifficultyColor()}20`,
              color: getDifficultyColor(),
              textTransform: 'uppercase',
            }}
          >
            {difficulty}
          </span>
        </div>
        
        {/* Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>
        
        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          <span>📝 {questionCount} questions</span>
          {creator && <span>👤 {creator}</span>}
          {createdAt && <span>📅 {formatDate(createdAt)}</span>}
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {onPlay && (
            <button
              onClick={onPlay}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              ▶ Play
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px' }}
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px', color: 'var(--error)' }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
