import React, { useState, useEffect } from 'react';
import { FaBookOpen, FaPenToSquare, FaFolderTree, FaListCheck, FaPalette, FaCheck, FaSpinner, FaClock, FaBookBookmark } from 'react-icons/fa6';

export default function Step4Processing() {
  const steps = [
    { icon: FaBookOpen, text: 'Reading your content...' },
    { icon: FaPenToSquare, text: 'Fixing grammar & spelling...' },
    { icon: FaFolderTree, text: 'Identifying chapters & sections...' },
    { icon: FaListCheck, text: 'Creating Table of Contents...' },
    { icon: FaPalette, text: 'Applying selected template...' },
  ];

  const bottomSteps = [
    { label: 'Processing Content', activeAt: 0, image: '/step1.png' },
    { label: 'Organizing Chapters', activeAt: 1, image: '/image copy 3.png' },
    { label: 'Creating Structure', activeAt: 2, image: '/image copy 4.png' },
    { label: 'Formatting Design', activeAt: 3, image: '/image copy 5.png' },
    { label: 'Almost Ready', activeAt: 4, image: '/image copy 6.png' },
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Simulate progression through steps every 4.5 seconds
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(interval);
  }, [steps.length]);

  const progressPercent = Math.min(100, Math.round(((activeStep + 1) / steps.length) * 100));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col lg:flex-row items-center gap-10 mb-12">
        {/* Left Side: Image */}
        <div className="flex-1 w-full max-w-md mx-auto flex justify-center items-center">
          <img 
            src="/image copy 2.png" 
            alt="Generating Book" 
            className="w-full h-auto object-contain max-h-[320px] drop-shadow-2xl" 
          />
        </div>

        {/* Right Side: Status & Checklist */}
        <div className="flex-1 w-full">
          <div className="flex justify-center lg:justify-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <FaBookBookmark className="text-xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center lg:text-left">Generating <span className="text-emerald-600">Your Book...</span></h2>
          <p className="text-gray-500 mb-8 text-sm text-center lg:text-left max-w-sm">Our AI is reading, organizing, and formatting your content into a beautiful book. This may take 15-30 seconds.</p>

          <div className="flex flex-col gap-3 mb-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i < activeStep;
              const isActive = i === activeStep;
              const isPending = i > activeStep;

              return (
                <div key={i} className={`flex items-center justify-between transition-all duration-500 ${isPending ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <FaCheck className="text-[10px]" />
                        </div>
                      ) : isActive ? (
                        <FaSpinner className="text-emerald-500 text-sm animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-2 ${isCompleted ? 'text-gray-900' : isActive ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                      <Icon className={`${isCompleted ? 'text-emerald-500' : isActive ? 'text-emerald-500' : 'text-gray-400'} text-sm`} />
                      <span className="text-sm">{step.text}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold ${isCompleted ? 'text-emerald-500' : isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {isCompleted ? 'Completed' : isActive ? 'Processing...' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="font-bold text-gray-700 text-sm">{progressPercent}%</span>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-2 mt-4 text-xs text-gray-400">
            <FaClock />
            <span>Please don't close this window</span>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Status Strip */}
      <div className="bg-gray-50 rounded-xl p-6 hidden md:flex items-center justify-between border border-gray-100">
        {bottomSteps.map((bStep, idx) => {
          const isDone = activeStep >= bStep.activeAt;
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center">
                  <img src={bStep.image} alt={bStep.label} className="w-full h-full object-contain drop-shadow-md" />
                  {isDone && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-100 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                       <FaCheck className="text-xs text-emerald-600" />
                    </div>
                  )}
                  {activeStep === bStep.activeAt && (
                    <div className="absolute -bottom-1 -right-1 bg-white border border-gray-200 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                       <FaSpinner className="text-xs text-emerald-600 animate-spin" />
                    </div>
                  )}
                </div>
                <span className={`text-xs font-bold ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>{bStep.label}</span>
              </div>
              
              {idx < bottomSteps.length - 1 && (
                <div className={`text-xl font-light ${activeStep > idx ? 'text-emerald-300' : 'text-gray-200'}`}>
                  &raquo;
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}
