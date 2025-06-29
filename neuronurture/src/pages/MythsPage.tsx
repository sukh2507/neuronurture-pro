import React from 'react';
import MythRealityViewer from '@/components/MythRealityViewer';

const MythsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center text-purple-700 mb-4">Myths vs Reality</h1>
      <MythRealityViewer />
    </div>
  );
};

export default MythsPage;
