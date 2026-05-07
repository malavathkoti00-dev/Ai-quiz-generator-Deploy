import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isInteractive?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  isInteractive = false,
  onClick,
  header,
  footer,
  style,
}) => {
  return (
    <div
      className={`card ${isInteractive ? 'card-interactive' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={style}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
