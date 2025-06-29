import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MythRealityItem {
  category: string;
  myth: string;
  reality: string;
  source: string;
}

const MythRealityViewer: React.FC = () => {
  const [data, setData] = useState<MythRealityItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:5000/api/myths')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to fetch myth-reality data', err));
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(start, start + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-6 space-y-6">
      {paginatedData.map((item, index) => (
        <Card key={index} className="rounded-2xl bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 shadow-md p-4">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">{item.category}</h2>
          <table className="w-full text-sm md:text-base border-collapse rounded-lg overflow-hidden bg-white shadow-sm">
            <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <tr>
                <th className="text-left p-2">Myth</th>
                <th className="text-left p-2">Reality</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 text-gray-800">{item.myth}</td>
                <td className="p-2 text-gray-800">{item.reality}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-right text-gray-600 mt-2">Source: {item.source}</p>
        </Card>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-center space-x-4 mt-6">
        <Button onClick={handlePrev} disabled={currentPage === 1}>
          Previous
        </Button>
        <span className="text-purple-800 font-medium">{currentPage} / {totalPages}</span>
        <Button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default MythRealityViewer;
