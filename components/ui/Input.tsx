
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, icon, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-text-main mb-1">{label}</label>}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'h-5 w-5 text-text-faded' })}
          </div>
        )}
        <input
          id={id}
          className={`block w-full px-3 py-2 border border-slate-300 rounded-md placeholder-text-faded focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
