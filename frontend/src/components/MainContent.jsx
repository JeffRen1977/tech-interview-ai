import React from 'react';

const MainContent = ({ children }) => {
  return (
    <main className="flex-1 p-8 overflow-y-auto bg-gray-900">
      {children}
    </main>
  );
};

export default MainContent;
