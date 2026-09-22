import React from 'react';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

export default function BookViewer({ content, onReset }) {
  // Simple markdown renderer for the MVP
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold mt-8 mb-4 text-gray-900">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-3xl font-bold mt-6 mb-3 text-gray-800">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-bold mt-4 mb-2 text-gray-800">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={index} className="block mt-2 font-bold">{line.replace(/\*\*/g, '')}</strong>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="text-gray-700 leading-relaxed mb-4 text-lg">{line}</p>;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={onReset}
            className="flex items-center text-gray-500 hover:text-gray-800 mb-2 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Write Another Book
          </button>
          <div className="flex items-center text-green-600 font-medium">
            <CheckCircle2 size={20} className="mr-2" />
            Book Successfully Generated
          </div>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <Download size={18} className="mr-2" />
          Export as Text
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 min-h-screen font-serif">
        <div className="max-w-3xl mx-auto">
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  );
}
