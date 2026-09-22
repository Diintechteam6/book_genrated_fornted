import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function GeneratorForm({ bookType, onGenerate, onBack, isLoading }) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('General');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, audience });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-gray-100 mt-10">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Book Types
      </button>

      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-3">
          {bookType}
        </span>
        <h2 className="text-3xl font-bold text-gray-900">What is your book about?</h2>
        <p className="text-gray-500 mt-2">Provide a clear topic to help the AI generate the best content.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Book Topic or Idea <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={bookType === 'Fiction' ? "e.g., A detective who solves crimes by talking to animals..." : "e.g., The complete beginner's guide to digital marketing..."}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="General">General (Everyone)</option>
            <option value="Beginners">Beginners / Students</option>
            <option value="Professionals">Professionals / Experts</option>
            {bookType === 'Fiction' && <option value="Young Adult">Young Adult (YA)</option>}
            {bookType === 'Fiction' && <option value="Children">Children</option>}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
            isLoading || !topic.trim() 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-1'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={24} />
              Generating Book...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" size={24} />
              Write My Book
            </>
          )}
        </button>
      </form>
    </div>
  );
}
