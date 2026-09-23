import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheck } from 'react-icons/fa6';
import Step1Details from '../../components/Step1Details';
import Step2Content from '../../components/Step2Content';
import Step3Template from '../../components/Step3Template';
import Step4Processing from '../../components/Step4Processing';
import Step5Download from '../../components/Step5Download';
import MyLibrary from '../../components/MyLibrary';
import { API } from '../../config';

export default function Generator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
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

  // Fetch book if bookId is in URL
  useEffect(() => {
    const fetchBookId = searchParams.get('bookId');
    if (fetchBookId && fetchBookId !== bookId) {
      const fetchBookData = async () => {
        setIsLoadingBook(true);
        try {
          const res = await axios.get(`${API}/books/${fetchBookId}`);
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
          }
        } catch (err) {
          alert('Error opening book: ' + (err.response?.data?.message || err.message));
        } finally {
          setIsLoadingBook(false);
        }
      };
      fetchBookData();
    }
  }, [searchParams, bookId]);

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

      const createRes = await axios.post(`${API}/books`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const id = createRes.data.data._id;
      setBookId(id);

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
    // Remove query param to clean URL
    if (searchParams.has('bookId')) {
      searchParams.delete('bookId');
      setSearchParams(searchParams);
    }
  };

  const steps = ['Details', 'Content', 'Template', 'Processing', 'Preview & Download'];

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>Book Generator</h1>
          <p className="text-gray-500 mt-1">Create, style, and download your books instantly.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Stepper */}
        {isLoadingBook && (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-center font-semibold">Loading book data...</div>
        )}
          <div className="bg-gray-50/80 border-b border-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = step === stepNumber;
                  const isCompleted = step > stepNumber;
                  return (
                    <div key={label} className="relative z-10 flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 ${
                          isActive ? 'bg-emerald-600 border-emerald-100 text-white shadow-md' :
                          isCompleted ? 'bg-emerald-500 border-emerald-50 text-white' :
                          'bg-white border-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <FaCheck className="text-sm" /> : stepNumber}
                      </div>
                      <span className={`absolute -bottom-7 w-max text-xs font-semibold ${
                        isActive ? 'text-emerald-700' :
                        isCompleted ? 'text-gray-700' :
                        'text-gray-400'
                      }`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 md:p-10 min-h-[500px]">
            {step === 1 && (
              <Step1Details formData={formData} setFormData={setFormData} onNext={handleNext} />
            )}
            {step === 2 && (
              <Step2Content formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />
            )}
            {step === 3 && (
              <Step3Template formData={formData} setFormData={setFormData} onNext={handleCreateBook} onBack={handleBack} />
            )}
            {step === 4 && (
              <Step4Processing />
            )}
          {step === 5 && structuredContent && (
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
      </div>
    </div>
  );
}
