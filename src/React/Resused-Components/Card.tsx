import React from "react";

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}> = ({ children, className = "", padding = true }) => {
  return (
    <div
      className={`rounded-xl shadow-lg border border-gray-200 ${padding ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
