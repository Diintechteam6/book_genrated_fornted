import React from 'react';
import { FaBook, FaFeatherPointed, FaArrowRight } from 'react-icons/fa6';

export default function CardSelector({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Which type of book</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-10">do you want to write?</h2>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center">
        {/* Non-Fiction Card */}
        <div 
          onClick={() => onSelect('Non-Fiction')}
          className="flex-1 bg-gradient-to-br from-blue-900 to-blue-700 rounded-3xl p-8 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/50 flex flex-col items-center text-center group border border-blue-400/30"
        >
          <div className="bg-white/10 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            <FaBook className="text-blue-100 text-5xl" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Non-Fiction Book</h3>
          <p className="text-blue-200 text-lg leading-relaxed">
            Self-help, business, how-to guides, memoir, workbook, etc.
          </p>
          <div className="mt-8 bg-blue-500 p-3 rounded-full group-hover:bg-blue-400 transition-colors">
            <FaArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Fiction Card */}
        <div 
          onClick={() => onSelect('Fiction')}
          className="flex-1 bg-gradient-to-br from-purple-100 to-white rounded-3xl p-8 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/30 flex flex-col items-center text-center group border border-purple-200"
        >
          <div className="bg-purple-100 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
            <FaFeatherPointed className="text-purple-600 text-5xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Fiction Book</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Novels, romance, thriller, mystery, fantasy, etc.
          </p>
          <div className="mt-8 bg-purple-600 p-3 rounded-full group-hover:bg-purple-500 transition-colors">
            <FaArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
