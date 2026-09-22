import React from 'react';
import { FaRobot, FaBookOpen, FaPenToSquare, FaFolderTree, FaListCheck, FaPalette } from 'react-icons/fa6';

export default function Step4Processing() {
  const steps = [
    { icon: FaBookOpen, text: 'Reading your content...' },
    { icon: FaPenToSquare, text: 'Fixing grammar & spelling...' },
    { icon: FaFolderTree, text: 'Identifying chapters & sections...' },
    { icon: FaListCheck, text: 'Creating Table of Contents...' },
    { icon: FaPalette, text: 'Applying selected template...' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-3xl shadow-sm animate-bounce">
          <FaRobot />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">AI is working on your book...</h2>
      <p className="text-gray-500 mb-8">Gemini is reading, organizing, and formatting your content. This may take 15-30 seconds.</p>

      <div className="flex flex-col gap-3 max-w-sm mx-auto text-left">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
              <div className="w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500 animate-pulse flex-shrink-0" />
              <Icon className="text-indigo-500 text-sm flex-shrink-0" />
              <span>{step.text}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-10">Please don't close this window</p>
    </div>
  );
}
