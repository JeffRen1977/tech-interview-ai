import React from 'react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <select
            className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-50 ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            ref={ref}
            {...props}
        >
            {children}
        </select>
    );
});
Select.displayName = "Select";

export { Select };