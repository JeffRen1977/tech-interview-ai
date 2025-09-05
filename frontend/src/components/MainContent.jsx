import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden bg-gray-900 pb-20 lg:pb-8 min-w-0">
      <div className="max-w-full min-w-0">
        {children}
      </div>
    </main>
  );
};

export default MainContent;
