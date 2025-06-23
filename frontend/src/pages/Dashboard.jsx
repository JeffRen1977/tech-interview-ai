import React from 'react';
import { Card } from '../components/ui/card';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-10">
        <Card className="bg-gray-800 p-6">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-400">Welcome to your AI Interview Coach Dashboard!</p>
          <p className="text-gray-400 mt-2">Use the sidebar to navigate to different features.</p>
        </Card>
      </div>
    </div>
  );
}