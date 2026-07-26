"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/10",
    secondary: "bg-accent-light hover:bg-accent-light/90 text-white shadow-sm shadow-accent-light/10",
    outline: "border border-slate-200 dark:border-[#182620] hover:bg-slate-50 dark:hover:bg-[#182620]/30 text-slate-700 dark:text-slate-200",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/10",
    ghost: "text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-[#182620]/30 hover:text-slate-900 dark:hover:text-slate-100",
    light: "bg-primary-50 dark:bg-emerald-950/30 hover:bg-primary-100 dark:hover:bg-emerald-950/60 text-primary-700 dark:text-emerald-350",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-4.5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
