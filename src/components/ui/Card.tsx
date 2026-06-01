"use client";

import React from "react";

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  headerAction,
  footer,
  hoverable = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#e6e8e6] overflow-hidden shadow-sm transition-all duration-300 ${
        hoverable ? "hover:shadow-md hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {/* Header */}
      {(title || description || headerAction) && (
        <div className="px-6 py-5 border-b border-[#e6e8e6] flex items-center justify-between gap-4">
          <div className="space-y-1">
            {title && typeof title === "string" ? (
              <h3 className="text-base font-bold text-slate-800 leading-none">{title}</h3>
            ) : (
              title
            )}
            {description && (
              <p className="text-xs font-medium text-slate-500">{description}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-5">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-[#e6e8e6] flex items-center justify-end gap-3 text-xs">
          {footer}
        </div>
      )}
    </div>
  );
};
