import React from 'react';
export const Button = ({ children, className, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${className}`} {...props}>{children}</button>;
