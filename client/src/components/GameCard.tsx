import React from 'react';

interface GameCardProps {
  roomCode: string;
  topic: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  onJoin?: () => void;
  onSpectate?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({
  roomCode,
  topic,
  hostName,
  playerCount,
  maxPlayers,
  status,
  onJoin,
  onSpectate,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'waiting':
        return { label: 'Waiting', color: 'var(--warning)', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'playing':
        return { label: 'Live', color: 'var(--success)', bgColor: 'rgba(16, 185, 129, 0.1)' };
      case 'finished':
        return { label: 'Ended', color: 'var(--text-muted)', bgColor: 'var(--bg-tertiary)' };
      default:
        return { label: 'Unknown', color: 'var(--text-muted)', bgColor: 'var(--bg-tertiary)' };
    }
  };
  
  const statusConfig = getStatusConfig();
  const isFull = playerCount >= maxPlayers;
  
  return (
    <div className="card" style={{ borderLeft: `4px solid ${statusConfig.color}` }}>
      <div className="card-body" style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '6px 12px',
                background: 'var(--primary-glow)',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '2px',
              }}
            >
              {roomCode}
            </span>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
        
        {/* Topic */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '4px',
            color: 'var(--text-primary)',
          }}
        >
          {topic}
        </h3>
        
        {/* Host */}
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Hosted by <strong style={{ color: 'var(--text-secondary)' }}>{hostName}</strong>
        </p>
        
        {/* Players */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {playerCount} / {maxPlayers} players
            </span>
          </div>
          {isFull && (
            <span
              style={{
                padding: '2px 8px',
                background: 'var(--error-light)',
                color: 'var(--error)',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              FULL
            </span>
          )}
        </div>
        
        {/* Progress Bar for players */}
        <div className="progress-bar" style={{ marginBottom: '16px', height: '6px' }}>
          <div
            className="progress-fill"
            style={{
              width: `${(playerCount / maxPlayers) * 100}%`,
              background: isFull ? 'var(--error)' : 'var(--success)',
            }}
          />
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {onJoin && status === 'waiting' && !isFull && (
            <button onClick={onJoin} className="btn btn-accent btn-block">
              Join Game
            </button>
          )}
          {onJoin && status === 'playing' && (
            <button onClick={onJoin} className="btn btn-success btn-block">
              Rejoin
            </button>
          )}
          {onSpectate && status === 'playing' && (
            <button onClick={onSpectate} className="btn btn-secondary btn-block">
              Spectate
            </button>
          )}
          {status === 'finished' && (
            <button disabled className="btn btn-secondary btn-block" style={{ opacity: 0.5 }}>
              Game Ended
            </button>
          )}
          {isFull && status === 'waiting' && (
            <button disabled className="btn btn-secondary btn-block" style={{ opacity: 0.5 }}>
              Room Full
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
