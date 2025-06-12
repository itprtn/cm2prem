
import React, { SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '../../constants';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, id, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-text-main mb-1">{label}</label>}
      <div className="relative">
        <select
          id={id}
          className={`block w-full appearance-none bg-white border border-slate-300 px-3 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm ${className}`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-faded">
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default Select;
