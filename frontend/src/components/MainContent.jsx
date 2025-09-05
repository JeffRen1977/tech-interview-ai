import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gray-900 pb-20 lg:pb-8">
      {children}
    </main>
  );
};

export default MainContent;
