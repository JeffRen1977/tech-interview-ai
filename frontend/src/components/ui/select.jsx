import React from 'react';

export const Select = ({ children, ...props }) => <select className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1" {...props}>{children}</select>;
