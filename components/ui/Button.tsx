import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'custom'; // Added custom size
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  leftIcon,
  rightIcon,
  className = '', 
  ...props 
}) => {
  // Base styles inspired by the provided CSS, using font-heading (Poppins) for primary buttons
  const baseStyles = `rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 inline-flex items-center justify-center`;
  
  // Size styles - 'md' is adjusted to match provided CSS buttons more closely
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs', // Original sm
    md: 'px-8 py-3 text-sm',    // Approximates padding: 0 34px; line-height: 53px; font-size: 15px;
    lg: 'px-6 py-3 text-base', // Original lg
    custom: '', // For cases where specific padding/line-height is needed via className
  };

  // Font style specific to primary buttons as per CSS
  const primaryFontStyles = "font-heading font-bold"; // Using font-heading (Poppins) and bold

  const variantStyles = {
    primary: `bg-primary text-white hover:bg-primary-hover focus:ring-primary ${primaryFontStyles}`,
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400 font-medium', // Kept original font-medium for secondary
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 font-medium',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-primary font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2 -ml-1 h-5 w-5">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 -mr-1 h-5 w-5">{rightIcon}</span>}
    </button>
  );
};

export default Button;