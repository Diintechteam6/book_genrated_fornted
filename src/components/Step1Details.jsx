import React, { useRef, useState } from 'react';
import axios from 'axios';
import { API } from '../config';
import { openImageInNewTab } from '../utils/imageViewer';
import {
  FaBookOpen, FaImage, FaFolderOpen, FaWandMagicSparkles, FaMagnifyingGlass,
  FaArrowUpRightFromSquare, FaRotate, FaPalette, FaBolt, FaSpinner, FaCloudArrowUp,
  FaCheck
} from 'react-icons/fa6';

export default function Step1Details({ formData, setFormData, onNext }) {
  const coverInputRef = useRef(null);
  const [coverMode, setCoverMode] = useState('upload'); // 'upload' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('modern');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          coverImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF or other documents, create a local object URL or store file
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        coverImage: url
      }));
    }
  };

  const removeCover = (e) => {
    if (e) e.stopPropagation();
    setFormData(prev => ({ ...prev, coverImage: null }));
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Open full-resolution cover image in a new tab safely with zoom & download options
  const handleOpenCoverInNewTab = (e) => {
    if (e) e.stopPropagation();
    if (!formData.coverImage) return;
    openImageInNewTab(formData.coverImage, formData.title, formData.author);
  };

  // Generate Cover Art using reliable Backend Generator
  const handleGenerateAICover = async () => {
    const titleText = formData.title.trim() || 'Mastering Knowledge';
    const authorText = formData.author.trim() || 'Author';
    const categoryText = formData.category || 'General';

    setIsGeneratingCover(true);
    try {
      const res = await axios.post(`${API}/books/generate-cover`, {
        title: titleText,
        author: authorText,
        category: categoryText,
        style: aiStyle,
        prompt: aiPrompt.trim()
      });

      if (res.data.success && res.data.coverImage) {
        setFormData(prev => ({
          ...prev,
          coverImage: res.data.coverImage
        }));
      }
    } catch (err) {
      console.error('Error generating cover:', err);
      // Fast SVG Vector fallback so user NEVER sees a broken image
      const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200"><rect width="800" height="1200" fill="%230f172a"/><rect x="36" y="36" width="728" height="1128" fill="none" stroke="%23f59e0b" stroke-width="2" rx="12"/><text x="400" y="520" font-family="serif" font-size="52" font-weight="bold" fill="%23ffffff" text-anchor="middle">${encodeURIComponent(titleText.substring(0, 28))}</text><text x="400" y="980" font-family="sans-serif" font-size="24" font-weight="bold" fill="%2394a3b8" text-anchor="middle">${encodeURIComponent(authorText)}</text></svg>`;
      setFormData(prev => ({ ...prev, coverImage: fallbackSvg }));
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const canNext = formData.title.trim() && formData.author.trim();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2.5">
            <FaBookOpen className="text-indigo-600 text-xl" /> Book Details & Cover
          </h2>
          <p className="text-gray-500 text-sm">Add your title, author, and custom or AI-generated book cover</p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full border border-indigo-100">
          Step 1 of 5
        </span>
      </div>

      {/* Book Cover Options */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FaImage className="text-indigo-600 text-sm" /> Book Front Cover (Optional)
          </label>
          <span className="text-xs text-gray-400">
            {formData.coverImage ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <FaCheck className="text-[10px]" /> Cover Attached
              </span>
            ) : 'Uses template theme by default'}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        {!formData.coverImage && (
          <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setCoverMode('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                coverMode === 'upload' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FaFolderOpen className="text-xs" /> Upload Image / PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setCoverMode('ai');
                if (!aiPrompt && formData.title) {
                  setAiPrompt(`Professional minimalist book cover for "${formData.title}", elegant artistic typography, 8k`);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                coverMode === 'ai' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FaWandMagicSparkles className="text-xs" /> Generate with AI
            </button>
          </div>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleCoverUpload}
          className="hidden"
          id="cover-upload-input"
        />

        {/* Existing Cover Preview */}
        {formData.coverImage ? (
          <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Clickable Book Cover Thumbnail */}
              <div
                onClick={handleOpenCoverInNewTab}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenCoverInNewTab(e); }}
                title="Click to view full cover in new tab"
                className="w-20 h-28 bg-slate-900 rounded-xl shadow-md border-2 border-indigo-200 overflow-hidden flex-shrink-0 cursor-pointer relative group transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-indigo-500"
              >
                <img
                  src={formData.coverImage}
                  alt="Book Cover Preview"
                  className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-all duration-300"
                  onError={(e) => {
                    console.warn('Cover preview failed to render, switching to fallback');
                    const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200"><rect width="800" height="1200" fill="%231e1b4b"/><rect x="40" y="40" width="720" height="1120" fill="none" stroke="%23f59e0b" stroke-width="2" rx="12"/><text x="400" y="550" font-family="serif" font-size="52" font-weight="bold" fill="%23ffffff" text-anchor="middle">Book Cover</text></svg>`;
                    e.target.src = fallbackSvg;
                  }}
                />
                {/* Hover overlay indication */}
                <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1 text-center p-1 backdrop-blur-xs">
                  <FaMagnifyingGlass className="text-sm" />
                  <span className="leading-tight px-1.5 py-0.5 rounded bg-indigo-600/80">New Tab</span>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
                  <FaCheck className="text-[9px]" /> Front Cover Active
                </span>
                <p className="text-sm font-bold text-gray-900">Front Cover Page Ready</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Yeh cover book ke pehle page par full-page render hoga.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCoverInNewTab}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <FaMagnifyingGlass className="text-xs" /> View in New Tab <FaArrowUpRightFromSquare className="text-[10px]" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  removeCover();
                  setCoverMode('ai');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FaRotate className="text-xs" /> AI Re-generate
              </button>
              <button
                type="button"
                onClick={removeCover}
                className="text-xs font-semibold text-red-600 hover:text-red-800 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ) : coverMode === 'ai' ? (
          /* AI Cover Generator Box */
          <div className="border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaPalette className="text-indigo-600 text-lg" />
                <span className="text-sm font-bold text-gray-800">AI Cover Artist</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                <FaBolt className="text-indigo-600 text-[10px]" /> Google Gemini & AI Artist
              </span>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Visual Art Prompt / Theme (Optional):
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder={`e.g., Modern clean book cover for "${formData.title || 'My Book'}"...`}
                className="w-full px-3.5 py-2 text-xs border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Style:</span>
                {['modern', 'tech', 'business', 'minimalist', 'fantasy', 'vintage', 'cyberpunk'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setAiStyle(st);
                      setAiPrompt(`${st} artistic book cover for "${formData.title || 'My Book'}", high quality`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      aiStyle === st
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateAICover}
                disabled={isGeneratingCover}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingCover ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Painting Cover...</span>
                  </>
                ) : (
                  <>
                    <FaWandMagicSparkles className="text-xs" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Manual Upload Box */
          <label
            htmlFor="cover-upload-input"
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/70 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <FaCloudArrowUp className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                Click to upload Custom Book Cover
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                PNG, JPG, WebP, or PDF • Book ke first page par cover banega
              </p>
            </div>
          </label>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Book Title <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.title}
            onChange={e => update('title', e.target.value)}
            placeholder="e.g., Mastering JavaScript: Zero to Hero"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author Name <span className="text-red-500">*</span>
          </label>
          <input
            value={formData.author}
            onChange={e => update('author', e.target.value)}
            placeholder="e.g., Vivek Chaurasiya"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={formData.language}
              onChange={e => update('language', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Hinglish</option>
              <option>Marathi</option>
              <option>Gujarati</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => update('category', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option>Technology</option>
              <option>Education</option>
              <option>Business</option>
              <option>Self-Help</option>
              <option>Fiction</option>
              <option>Science</option>
              <option>General</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Short description or overview of the book..."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className={`mt-6 w-full py-3.5 rounded-xl font-bold text-base transition-all ${
          canNext
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue → Add Book Content
      </button>
    </div>
  );
}
