
import React from 'react';

interface BaseFreebiesCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const BaseFreebiesCard: React.FC<BaseFreebiesCardProps> = ({
  children,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden flex cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BaseFreebiesCard;
