import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleActions?: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleActions }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden border border-card-border ${className}`}>
      {title && (
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h3 className="text-lg font-heading font-semibold text-text-headings">{title}</h3>
          {titleActions && <div>{titleActions}</div>}
        </div>
      )}
      <div className={title ? "p-4" : ""}> 
        {children}
      </div>
    </div>
  );
};

export default Card;