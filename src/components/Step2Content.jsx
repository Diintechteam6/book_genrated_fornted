import React, { useState } from 'react';
import { FaFileLines, FaPenToSquare, FaFolderOpen, FaCloudArrowUp, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

export default function Step2Content({ formData, setFormData, onNext, onBack }) {
  const [inputMode, setInputMode] = useState(formData.file ? 'upload' : 'paste'); // 'paste' or 'upload'
  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const canNext = (inputMode === 'paste' && formData.rawContent.trim().length >= 50) ||
                  (inputMode === 'upload' && formData.file);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <FaFileLines className="text-indigo-600 text-xl" /> Book Content
      </h2>
      <p className="text-gray-500 mb-6">Provide your 80% book content — AI will organize and format it</p>

      {/* Toggle */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setInputMode('paste')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
            ${inputMode === 'paste' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
          <FaPenToSquare className="text-xs" /> Paste Text
        </button>
        <button onClick={() => setInputMode('upload')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
            ${inputMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
          <FaFolderOpen className="text-xs" /> Upload File
        </button>
      </div>

      {inputMode === 'paste' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your book content here <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.rawContent}
            onChange={e => update('rawContent', e.target.value)}
            rows={14}
            placeholder={`Chapter 1: Introduction\nYour content here...\n\nChapter 2: Getting Started\nMore content here...\n\n(Write as much as you can — the more you provide, the better the book will be)`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none text-sm font-mono"
          />
          <p className={`text-xs mt-1 flex items-center gap-1 ${formData.rawContent.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
            <span>{formData.rawContent.length} characters</span>
            {formData.rawContent.length < 50 ? (
              <span>(minimum 50 required)</span>
            ) : (
              <FaCheck className="inline ml-1 text-green-500 text-xs" />
            )}
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload file (.txt, .docx, .pdf) <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-indigo-300 transition-colors">
            <div className="text-4xl mb-3 text-indigo-400 flex justify-center">
              <FaCloudArrowUp className="text-4xl text-indigo-400" />
            </div>
            <p className="text-gray-600 mb-4">Drag & drop or click to choose file</p>
            <input type="file" accept=".txt,.docx,.pdf"
              onChange={e => update('file', e.target.files[0])}
              className="hidden" id="fileInput" />
            <label htmlFor="fileInput" className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
              Choose File
            </label>
            {formData.file && (
              <p className="text-green-600 font-medium mt-4 flex items-center justify-center gap-1.5">
                <FaCheck className="text-sm" /> {formData.file.name}
              </p>
            )}
            <p className="text-gray-400 text-xs mt-3">Max file size: 50MB (.pdf, .docx, .txt)</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-xl font-bold text-base border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
          <FaArrowLeft className="text-sm" /> Back
        </button>
        <button onClick={onNext} disabled={!canNext}
          className={`flex-2 flex-grow py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
            ${canNext ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
          Continue <FaArrowRight className="text-sm" /> Choose Template
        </button>
      </div>
    </div>
  );
}
