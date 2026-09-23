import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyLibraryComponent from '../../components/MyLibrary';

export default function Library() {
  const navigate = useNavigate();

  const handleOpenBook = (id) => {
    navigate(`/generator?bookId=${id}`);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>My Library</h1>
          <p className="text-gray-500 mt-1">View, manage, and download all your generated books.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <MyLibraryComponent onOpenBook={handleOpenBook} />
      </div>
    </div>
  );
}
