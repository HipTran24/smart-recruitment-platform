import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-white text-black hover:bg-zinc-100 font-semibold',
  secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 font-medium',
  ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 font-medium',
  danger: 'bg-red-600 text-white hover:bg-red-500 font-semibold',
  outline: 'bg-transparent text-white border border-zinc-600 hover:bg-zinc-800 font-medium',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-lg gap-2',
};

export function Button({ variant = 'primary', size = 'md', icon, iconRight, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center cursor-pointer transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
