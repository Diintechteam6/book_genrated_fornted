import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../config';
import {
  FaPalette,
  FaScroll,
  FaGraduationCap,
  FaWandMagicSparkles,
  FaLaptopCode,
  FaCheck,
  FaPaperclip,
  FaSpinner,
  FaBookOpen,
  FaListCheck,
  FaQuoteLeft,
  FaListOl,
  FaArrowLeft,
  FaRocket,
  FaEye
} from 'react-icons/fa6';

export default function Step3Template({ formData, setFormData, onNext, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
  const [styleBookFileName, setStyleBookFileName] = useState('');
  const [styleConfig, setStyleConfig] = useState(null);
  const styleBookInputRef = useRef(null);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const getTemplateIcon = (id) => {
    switch (id) {
      case 'modern': return <FaPalette className="text-blue-500" />;
      case 'classic': return <FaScroll className="text-amber-500" />;
      case 'education': return <FaGraduationCap className="text-indigo-500" />;
      case 'minimal': return <FaWandMagicSparkles className="text-emerald-500" />;
      case 'technical': return <FaLaptopCode className="text-cyan-500" />;
      default: return <FaPalette className="text-indigo-500" />;
    }
  };

  useEffect(() => {
    axios.get(`${API}/templates`)
      .then(res => setTemplates(res.data.data))
      .catch(() => setTemplates([
        { id: 'modern',    name: 'Modern',    description: 'Clean dark blue design with red accents' },
        { id: 'classic',  name: 'Classic',   description: 'Traditional book style with serif fonts' },
        { id: 'education',name: 'Education', description: 'Colorful and student-friendly layout' },
        { id: 'minimal',  name: 'Minimal',   description: 'Clean, simple and distraction-free' },
        { id: 'technical',name: 'Technical', description: 'Dark code-editor style for tech books' },
      ]));
  }, []);

  // Handle reference book upload for style analysis
  const handleStyleBookUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.txt'].includes(ext)) {
      alert('Only PDF or TXT files are supported for style analysis.');
      return;
    }

    setStyleBookFileName(file.name);
    setIsAnalyzingStyle(true);
    update('templateId', 'custom-style'); // Select this option

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch(`${API}/books/analyze-style`, {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Style analysis failed');

      setStyleConfig(data.styleConfig);
      // Store previewCSS in formData so Step5 can use it at download time
      setFormData(prev => ({
        ...prev,
        templateId: 'custom-style',
        customStyleCSS: data.previewCSS,
        customStyleConfig: data.styleConfig,
      }));
    } catch (err) {
      alert('Style analysis failed: ' + err.message);
      update('templateId', 'modern');
      setStyleBookFileName('');
      setStyleConfig(null);
    } finally {
      setIsAnalyzingStyle(false);
      if (styleBookInputRef.current) styleBookInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <FaPalette className="text-indigo-600 text-xl" /> Choose Template
      </h2>
      <p className="text-gray-500 mb-8">Your content will be designed using the selected template</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Existing 5 templates ── */}
        {templates.map(t => (
          <div key={t.id}
            onClick={() => update('templateId', t.id)}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all
              ${formData.templateId === t.id
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-100 hover:border-indigo-200 hover:shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl flex items-center justify-center w-8 h-8">{getTemplateIcon(t.id)}</span>
              <h3 className="font-bold text-gray-900 text-lg">{t.name}</h3>
              
              <div className="ml-auto flex items-center gap-2">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); window.open('/templates', '_blank'); }}
                  className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 rounded hover:bg-indigo-50 flex items-center gap-1 text-xs font-semibold"
                  title="Live Preview Theme"
                >
                  <FaEye className="text-sm" /> <span className="hidden sm:inline">Preview</span>
                </button>
                {formData.templateId === t.id && (
                  <span className="text-indigo-600 font-bold text-xs bg-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    Selected <FaCheck className="text-[10px]" />
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-500 text-sm">{t.description}</p>
          </div>
        ))}

        {/* ── 6th: Style from My Book ── */}
        <div
          className={`p-5 rounded-xl border-2 cursor-pointer transition-all col-span-1
            ${formData.templateId === 'custom-style'
              ? 'border-violet-500 bg-violet-50 shadow-md'
              : 'border-dashed border-violet-300 hover:border-violet-400 hover:shadow-sm bg-violet-50/40'}`}
          onClick={() => !isAnalyzingStyle && styleBookInputRef.current?.click()}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl flex items-center justify-center w-8 h-8">
              {isAnalyzingStyle ? (
                <FaSpinner className="animate-spin text-violet-600 text-2xl" />
              ) : (
                <FaPaperclip className="text-violet-600 text-2xl" />
              )}
            </span>
            <h3 className="font-bold text-gray-900 text-lg">
              {isAnalyzingStyle ? 'Analyzing Style…' : 'Style from My Book'}
            </h3>
            {formData.templateId === 'custom-style' && !isAnalyzingStyle && (
              <span className="ml-auto text-violet-600 font-bold text-xs bg-violet-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                Selected <FaCheck className="text-[10px]" />
              </span>
            )}
          </div>

          {/* Description or loaded file info */}
          {styleBookFileName && styleConfig ? (
            <div className="space-y-2">
              <p className="text-violet-700 text-sm font-medium flex items-center gap-1.5">
                <FaBookOpen className="text-xs" /> {styleBookFileName}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full capitalize">
                  {styleConfig.writingTone}
                </span>
                <span className="bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full capitalize">
                  {styleConfig.fontStyle}
                </span>
                {styleConfig.hasSummaryBox && (
                  <span className="bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FaListCheck className="text-[10px]" /> Summary Boxes
                  </span>
                )}
                {styleConfig.hasQuotes && (
                  <span className="bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FaQuoteLeft className="text-[10px]" /> Quotes
                  </span>
                )}
                {styleConfig.hasNumberedKeyPoints && (
                  <span className="bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FaListOl className="text-[10px]" /> Key Points
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); styleBookInputRef.current?.click(); }}
                className="text-xs text-violet-500 underline mt-1"
              >
                Change book
              </button>
            </div>
          ) : (
            <p className="text-violet-500 text-sm">
              {isAnalyzingStyle
                ? 'Gemini AI is reading and analyzing your book\'s style…'
                : 'Upload a reference PDF — AI clones its chapter format, tone & layout'}
            </p>
          )}

          {/* Hidden file input */}
          <input
            ref={styleBookInputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleStyleBookUpload}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-xl font-bold text-base border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
          <FaArrowLeft className="text-sm" /> Back
        </button>
        <button onClick={onNext}
          disabled={isAnalyzingStyle}
          className={`flex-grow py-4 rounded-xl font-bold text-base text-white transition-all flex items-center justify-center gap-2
            ${isAnalyzingStyle
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}>
          {isAnalyzingStyle ? (
            <>
              <FaSpinner className="animate-spin text-sm" /> Analyzing Style…
            </>
          ) : (
            <>
              <FaRocket className="text-sm" /> Generate Book with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
