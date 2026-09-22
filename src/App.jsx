import React, { useState } from 'react';
import axios from 'axios';
import { FaBookOpen, FaBookBookmark, FaWandMagicSparkles, FaCheck } from 'react-icons/fa6';
import Step1Details from './components/Step1Details';
import Step2Content from './components/Step2Content';
import Step3Template from './components/Step3Template';
import Step4Processing from './components/Step4Processing';
import Step5Download from './components/Step5Download';
import MyLibrary from './components/MyLibrary';
import './App.css';
import { API } from './config';

export default function App() {
  const [currentTab, setCurrentTab] = useState('generator'); // 'generator' | 'library'
  const [step, setStep] = useState(1);
  const [bookId, setBookId] = useState(null);
  const [structuredContent, setStructuredContent] = useState(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [formData, setFormData] = useState({
    title: '', author: '', language: 'English',
    category: 'General', description: '',
    templateId: 'modern', rawContent: '', file: null,
    coverImage: null
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // Open existing book from MyLibrary
  const handleOpenSavedBook = async (id) => {
    setIsLoadingBook(true);
    try {
      const res = await axios.get(`${API}/books/${id}`);
      const bookData = res.data.data;
      if (bookData) {
        setBookId(bookData._id);
        setFormData({
          title: bookData.title || '',
          author: bookData.author || '',
          language: bookData.language || 'English',
          category: bookData.category || 'General',
          description: bookData.description || '',
          templateId: bookData.templateId || 'modern',
          rawContent: bookData.originalContent || '',
          file: null,
          coverImage: bookData.coverImage || null
        });
        setStructuredContent(bookData.structuredContent || null);
        setStep(5);
        setCurrentTab('generator');
      }
    } catch (err) {
      alert('Error opening book: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingBook(false);
    }
  };

  // Step 1+2+3 → Submit form → Create book in DB
  const handleCreateBook = async () => {
    setStep(4);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('author', formData.author);
      fd.append('language', formData.language);
      fd.append('category', formData.category);
      fd.append('description', formData.description);
      fd.append('templateId', formData.templateId);
      if (formData.coverImage) {
        fd.append('coverImage', formData.coverImage);
      }
      if (formData.file) {
        fd.append('file', formData.file);
      } else {
        fd.append('rawContent', formData.rawContent);
      }

      // Create book
      const createRes = await axios.post(`${API}/books`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const id = createRes.data.data._id;
      setBookId(id);

      // Process with AI
      const processRes = await axios.post(`${API}/books/${id}/process`);
      setStructuredContent(processRes.data.data);
      setStep(5);
    } catch (err) {
      console.error(err);
      alert('Error processing book: ' + (err.response?.data?.message || err.message));
      setStep(3);
    }
  };

  const handleDownloadPDF = async (customContent, customTemplateId, pageDimensions, customCSS) => {
    try {
      // Use CSS from Step3 style analysis if available and no explicit CSS passed
      const effectiveCSS = customCSS || (
        (customTemplateId === 'custom-style' || formData.templateId === 'custom-style')
          ? formData.customStyleCSS
          : null
      );
      const response = await axios.post(`${API}/books/${bookId}/generate-pdf`, {
        structuredContent: customContent || structuredContent,
        templateId: customTemplateId || formData.templateId,
        pageDimensions,
        ...(effectiveCSS ? { customCSS: effectiveCSS } : {})
      }, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const downloadName = (customContent?.title || formData.title || 'My_Book').replace(/[^a-zA-Z0-9_\-]/g, '_');
      link.setAttribute('download', `${downloadName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error generating PDF: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReset = () => {
    setStep(1);
    setBookId(null);
    setStructuredContent(null);
    setFormData({
      title: '', author: '', language: 'English',
      category: 'General', description: '',
      templateId: 'modern', rawContent: '', file: null,
      coverImage: null
    });
  };

  const steps = ['Details', 'Content', 'Template', 'Processing', 'Preview & Download'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={handleReset}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center text-lg font-black">
              <FaBookOpen className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-gray-900 tracking-tight whitespace-nowrap">AI <span className="text-indigo-600">Book</span> Generator</span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md hidden sm:inline-block">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">AI Publishing & Formatting Engine</p>
            </div>
          </div>

          {/* Center: Step Progress (Shown only in Generator mode on desktop) */}
          {currentTab === 'generator' && (
            <div className="hidden lg:flex items-center bg-gray-50/90 border border-gray-200/70 px-4 py-2 rounded-2xl shadow-2xs">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center gap-2 transition-all ${
                    step === i + 1 ? 'scale-105' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shadow-xs ${
                      step > i + 1
                        ? 'bg-emerald-500 text-white'
                        : step === i + 1
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                        : 'bg-white border border-gray-200 text-gray-400'
                    }`}>
                      {step > i + 1 ? <FaCheck className="text-[9px]" /> : i + 1}
                    </div>
                    <span className={`text-xs font-bold whitespace-nowrap ${
                      step === i + 1
                        ? 'text-indigo-700 font-extrabold'
                        : step > i + 1
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}>
                      {s}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-6 xl:w-8 h-[2px] mx-2.5 rounded-full transition-colors ${
                      step > i + 1 ? 'bg-emerald-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Right: Navigation Tabs */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-gray-100/90 border border-gray-200/60 p-1 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentTab('generator')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  currentTab === 'generator'
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-gray-950/5'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <FaWandMagicSparkles className="text-xs" />
                <span>Creator</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('library')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  currentTab === 'library'
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-gray-950/5'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <FaBookBookmark className="text-xs" />
                <span>My Library</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${step === 5 && currentTab === 'generator' ? 'w-full max-w-[1650px] px-3 md:px-6 py-2.5' : 'max-w-6xl px-4 py-6'} mx-auto transition-all`}>
        {isLoadingBook ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto">
            <div className="flex justify-center mb-4"><FaBookOpen className="text-5xl text-indigo-600 animate-bounce" /></div>
            <h3 className="text-xl font-bold text-gray-900">Loading Book in Editor...</h3>
            <p className="text-gray-500 text-sm mt-1">Fetching all chapters, sections and templates</p>
          </div>
        ) : currentTab === 'library' ? (
          <MyLibrary
            onOpenBook={handleOpenSavedBook}
            onCreateNew={() => {
              handleReset();
              setCurrentTab('generator');
            }}
          />
        ) : (
          <div className={step === 5 ? 'w-full' : 'max-w-3xl mx-auto'}>
            {step === 1 && <Step1Details formData={formData} setFormData={setFormData} onNext={handleNext} />}
            {step === 2 && <Step2Content formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />}
            {step === 3 && <Step3Template formData={formData} setFormData={setFormData} onNext={handleCreateBook} onBack={handleBack} />}
            {step === 4 && <Step4Processing />}
            {step === 5 && (
              <Step5Download
                book={structuredContent}
                formData={formData}
                setFormData={setFormData}
                bookId={bookId}
                onDownload={handleDownloadPDF}
                onReset={handleReset}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

