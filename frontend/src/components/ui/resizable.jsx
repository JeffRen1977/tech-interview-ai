import React from 'react';

export const ResizablePanelGroup = ({ children, direction }) => (
    <div className={`flex w-full h-full ${direction === 'vertical' ? 'flex-col' : ''}`}>
        {children}
    </div>
);

export const ResizablePanel = ({ children, defaultSize }) => {
    const style = {
        // A simplified flex-basis for demonstration.
        // A real implementation would use a more complex state management for resizing.
        flex: `${defaultSize} 1 0%`,
        overflow: 'hidden'
    };
    return <div style={style} className="flex flex-col">{children}</div>;
};

export const ResizableHandle = () => (
    <div className="h-2 bg-gray-700 cursor-row-resize hover:bg-indigo-500 transition-colors flex-shrink-0" />
);