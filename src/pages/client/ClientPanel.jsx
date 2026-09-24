import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { API } from '../../config';
import { FaBookOpen, FaPalette, FaCheckCircle, FaSpinner, FaBook, FaScroll, FaGraduationCap, FaAlignLeft, FaCode } from 'react-icons/fa';

const bookMeta = {
  title: "The Silent Cosmos",
  subtitle: "A Journey Beyond the Stars",
  author: "Vivek Raj",
  publisher: "Antigravity Press",
  publishedYear: "2026",
  isbn: "978-3-16-148410-0",
  edition: "First Edition",
  intro: "This book is dedicated to all the explorers of the unknown. An epic journey through the uncharted territories of the universe, discovering secrets that were never meant to be found.",
  coverImage: "https://images.unsplash.com/photo-1618123069754-cd64c230a169?q=80&w=800&auto=format&fit=crop"
};

// Helper to generate dummy text
const generateDummyBook = () => {
  const subtitles = [
    "The Awakening", "A New Dawn", "The Gathering Storm", 
    "Shadows of the Past", "The Hidden City", "Echoes of Eternity",
    "The Forgotten Path", "Beyond the Horizon", "The Final Stand", "Epilogue"
  ];
  
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    title: `Chapter ${i + 1}`,
    subtitle: subtitles[i % subtitles.length],
    // 7 paragraphs total for a chapter
    paragraphs: Array.from({ length: 7 }).map(() => "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu ullamcorper orci.")
  }));
};

// Reusable Page Wrapper to give PDF-like EXACT A4 page feel
const PdfPage = ({ children, tpl, pageNumber, id }) => {
  const isTechnical = tpl === 'technical';
  const pageBg = isTechnical ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800';
  
  return (
    <div id={id} className={`w-full max-w-[800px] h-[1130px] mx-auto shadow-xl mb-12 flex flex-col relative overflow-hidden transition-all duration-300 ${pageBg}`}>
      {children}
      
      {/* Dynamic Header/Footer (only if pageNumber is provided) */}
      {pageNumber && (
        <div className={`absolute bottom-12 px-16 md:px-24 w-full flex justify-between items-center text-sm ${
          tpl === 'modern' ? 'text-gray-400 font-sans' : 
          tpl === 'classic' ? 'text-gray-500 font-serif' : 
          tpl === 'education' ? 'text-indigo-400 font-sans font-medium' : 
          tpl === 'minimal' ? 'text-gray-400 font-sans tracking-widest uppercase' : 
          'text-slate-500 font-mono' // technical
        }`}>
          <span>{bookMeta.title}</span>
          <span className="font-bold">
            {tpl === 'classic' ? `- ${pageNumber} -` : 
             tpl === 'minimal' ? String(pageNumber).padStart(2, '0') : 
             tpl === 'technical' ? `[${pageNumber}]` : pageNumber}
          </span>
        </div>
      )}
    </div>
  );
};

// --- AUTOMATIC MS WORD-LIKE PAGINATION COMPONENT ---
const AutoPaginator = ({ dummyBook, tpl, renderCover, renderTitleAndCopyrightPage, renderIntro, renderIndex }) => {
  const [paginatedPages, setPaginatedPages] = useState([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const measureRef = useRef(null);

  // 1. Flatten the book data into independent "blocks" (headings and paragraphs)
  const allBlocks = useMemo(() => {
    let blocks = [];
    dummyBook.forEach(ch => {
      blocks.push({ type: 'heading', chapter: ch, id: `ch-heading-${ch.id}` });
      ch.paragraphs.forEach((p, idx) => {
        blocks.push({ type: 'paragraph', text: p, chapterId: ch.id, pIdx: idx, id: `ch-${ch.id}-p-${idx}` });
      });
    });
    return blocks;
  }, [dummyBook]);

  // 2. Measure the heights of each block and group them into A4 pages automatically
  useEffect(() => {
    setIsCalculating(true);
    
    // Allow React to render the hidden measurement container first
    const timer = setTimeout(() => {
      if (!measureRef.current) return;
      
      const children = Array.from(measureRef.current.children);
      const pages = [];
      let currentPageBlocks = [];
      let currentHeight = 0;
      
      // MAX_HEIGHT is the safe area inside an A4 page (1130px total height - margins and footer space)
      const MAX_HEIGHT = 930; 

      children.forEach((child, index) => {
        const height = child.getBoundingClientRect().height;
        const style = window.getComputedStyle(child);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        const totalElementHeight = height + Math.max(marginTop, marginBottom); // Margin collapse approximation
        const block = allBlocks[index];

        // 1. Force Page Break if this is a new Chapter Heading
        if (block.type === 'heading' && currentPageBlocks.length > 0) {
          pages.push(currentPageBlocks);
          currentPageBlocks = [];
          currentHeight = 0;
        }

        // 2. Standard Page Overflow Check
        if (currentHeight + totalElementHeight > MAX_HEIGHT && currentPageBlocks.length > 0) {
          
          // MS Word Style Paragraph Splitting Logic
          // If we have at least 60px of space left and it's a paragraph, we split the text
          if (block.type === 'paragraph' && currentHeight < MAX_HEIGHT - 60) {
            const remainingSpace = MAX_HEIGHT - currentHeight;
            // Calculate ratio of how much text can fit in the remaining space
            // (subtracting typical line-height/margins for safety)
            const textHeight = height; 
            const ratio = (remainingSpace - 10) / textHeight; 
            
            if (ratio > 0.1 && ratio < 0.95) { // Only split if it's a meaningful chunk
              const textLength = block.text.length;
              const splitIndexApprox = Math.floor(textLength * ratio);
              
              // Find the nearest space so we don't cut a word in half
              let splitIndex = block.text.lastIndexOf(' ', splitIndexApprox);
              if (splitIndex === -1) splitIndex = splitIndexApprox;

              const part1Text = block.text.substring(0, splitIndex) + '-';
              const part2Text = block.text.substring(splitIndex + 1);

              // Push the first half to the current page
              currentPageBlocks.push({ ...block, text: part1Text, isSplitStart: true, id: `${block.id}-part1` });
              pages.push(currentPageBlocks);
              
              // Push the second half to the next page
              currentPageBlocks = [{ ...block, text: part2Text, isSplitEnd: true, id: `${block.id}-part2` }];
              // Approximate the height of the remaining text on the new page
              currentHeight = (textHeight * (1 - ratio)) + Math.max(marginTop, marginBottom);
              
              return; // Skip normal pushing
            }
          }

          // If not splitting, move the whole block to the next page
          pages.push(currentPageBlocks);
          currentPageBlocks = [];
          currentHeight = 0;
        }

        currentPageBlocks.push(block);
        currentHeight += totalElementHeight;
      });

      // Push the last page
      if (currentPageBlocks.length > 0) {
        pages.push(currentPageBlocks);
      }

      setPaginatedPages(pages);
      setIsCalculating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [allBlocks, tpl]);

  // Helper to render a specific block based on template
  const renderBlock = (block) => {
    if (block.type === 'heading') {
      const ch = block.chapter;
      return (
        <div key={block.id} className={`mb-10 ${
          tpl === 'modern' ? 'border-t-8 border-blue-600 pt-10' : 
          tpl === 'classic' ? 'pt-10' : 
          tpl === 'education' ? 'pt-10' : 
          tpl === 'minimal' ? 'pt-10 text-center' : 'pt-8'
        }`}>
          {tpl === 'modern' && (
            <>
              <div className="w-16 h-1 bg-red-500 mb-8"></div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{ch.title}</h1>
              <h2 className="text-2xl font-light text-blue-600">{ch.subtitle}</h2>
            </>
          )}
          {tpl === 'classic' && (
            <>
              <h1 className="text-5xl font-bold text-slate-900 text-center mb-4 border-b-2 border-slate-800 pb-4">Chapter {ch.id}</h1>
              <h2 className="text-2xl font-italic text-slate-600 text-center italic">{ch.subtitle}</h2>
            </>
          )}
          {tpl === 'education' && (
            <>
              <div className="bg-yellow-100 inline-block px-4 py-1 rounded-full text-yellow-800 font-bold text-sm mb-6">LESSON {ch.id}</div>
              <h1 className="text-4xl font-extrabold text-indigo-700 mb-8">{ch.subtitle}</h1>
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">💡 Key Concept</h3>
                <p className="text-blue-900 m-0">Understanding the core principles of {ch.subtitle.toLowerCase()} is essential.</p>
              </div>
            </>
          )}
          {tpl === 'minimal' && (
            <h1 className="text-3xl font-light text-slate-800 tracking-widest uppercase mb-6">
              {String(ch.id).padStart(2, '0')} / {ch.subtitle}
            </h1>
          )}
          {tpl === 'technical' && (
            <>
              <h1 className="text-3xl font-bold text-green-400 mb-6">$ ./start_chapter_{ch.id}.sh</h1>
              <h2 className="text-xl text-blue-400"># {ch.title}: {ch.subtitle}</h2>
            </>
          )}
        </div>
      );
    }

    if (block.type === 'paragraph') {
      return (
        <p key={block.id} className={`
          ${block.isSplitStart ? 'mb-0' : 'mb-6'} 
          ${block.isSplitEnd ? 'mt-0 indent-0' : ''} 
          ${
          tpl === 'classic' ? `text-lg leading-loose text-slate-700 ${!block.isSplitEnd ? 'indent-8' : ''}` :
          tpl === 'education' ? 'text-lg leading-relaxed text-slate-700 font-medium' :
          tpl === 'minimal' ? 'text-md leading-loose text-slate-500 text-justify' :
          tpl === 'technical' ? 'text-base leading-relaxed text-slate-400' :
          'text-lg leading-relaxed text-slate-600'
        }`}>
          {block.text}
        </p>
      );
    }
  };

  return (
    <div className="w-full relative">
      {/* HIDDEN MEASUREMENT CONTAINER */}
      {isCalculating && (
        <div className="absolute top-0 left-0 w-full flex justify-center pb-32">
          <PdfPage tpl={tpl} id="measure-container">
            <div className={`px-16 md:px-24 pt-16 h-full opacity-0 pointer-events-none ${
              tpl === 'modern' ? 'font-sans' : 
              tpl === 'classic' ? 'font-serif' : 
              tpl === 'education' ? 'font-sans' : 
              tpl === 'minimal' ? 'font-sans' : 'font-mono'
            }`}>
              <div ref={measureRef}>
                {allBlocks.map(block => renderBlock(block))}
              </div>
            </div>
          </PdfPage>
          {/* Loading Overlay */}
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-200/80 backdrop-blur-sm rounded-xl">
             <FaSpinner className="animate-spin text-5xl text-emerald-600 mb-4" />
             <h3 className="text-xl font-bold text-gray-800">Auto-Formatting Pages...</h3>
             <p className="text-gray-500 mt-2">Flowing text to fit perfectly, MS Word style.</p>
          </div>
        </div>
      )}

      {/* ACTUAL VISIBLE RENDERED PAGES */}
      <div className={isCalculating ? 'invisible' : 'visible animate-[fadeIn_0.5s_ease-out]'}>
        {renderCover(tpl)}
        {renderTitleAndCopyrightPage(tpl)}
        {renderIntro(tpl)}
        {renderIndex(tpl)}
        
        {paginatedPages.map((pageBlocks, pageIndex) => (
          <PdfPage key={`auto-page-${pageIndex}`} tpl={tpl} pageNumber={pageIndex + 4}>
            <div className={`px-16 md:px-24 pt-16 pb-32 h-full overflow-hidden ${
              tpl === 'modern' ? 'font-sans' : 
              tpl === 'classic' ? 'font-serif' : 
              tpl === 'education' ? 'font-sans relative' : 
              tpl === 'minimal' ? 'font-sans' : 'font-mono'
            }`}>
              {tpl === 'education' && <div className="absolute top-0 left-0 bottom-0 w-4 bg-yellow-400"></div>}
              
              <div className={`${tpl === 'education' ? 'pl-8' : ''}`}>
                {pageBlocks.map(block => renderBlock(block))}
              </div>
            </div>
          </PdfPage>
        ))}
      </div>
    </div>
  );
};

export default function ClientPanel() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const dummyBook = generateDummyBook();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/templates`);
      if (response.data.success) {
        setTemplates(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedTemplate(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIcon = (id) => {
    switch(id) {
      case 'modern': return <FaBook />;
      case 'classic': return <FaScroll />;
      case 'education': return <FaGraduationCap />;
      case 'minimal': return <FaAlignLeft />;
      case 'technical': return <FaCode />;
      default: return <FaBookOpen />;
    }
  };

  const getTemplateIconClasses = (id, isSelected) => {
    if (isSelected) return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    
    switch(id) {
      case 'modern': return 'bg-blue-50 text-blue-500 border-blue-100 group-hover:bg-blue-100 group-hover:text-blue-600';
      case 'classic': return 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100 group-hover:text-amber-700';
      case 'education': return 'bg-purple-50 text-purple-500 border-purple-100 group-hover:bg-purple-100 group-hover:text-purple-600';
      case 'minimal': return 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200 group-hover:text-slate-700';
      case 'technical': return 'bg-teal-50 text-teal-500 border-teal-100 group-hover:bg-teal-100 group-hover:text-teal-600';
      default: return 'bg-gray-100 text-gray-500 border-gray-200 group-hover:bg-gray-200';
    }
  };

  const renderCover = (tpl) => (
    <PdfPage tpl={tpl}>
      <div className="flex-1 relative flex flex-col justify-center items-center text-center">
        <img src={bookMeta.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 border-4 border-white/30 p-12 backdrop-blur-sm bg-black/40 rounded-xl w-3/4">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-widest" style={{ fontFamily: tpl === 'classic' ? 'serif' : tpl === 'technical' ? 'monospace' : 'sans-serif' }}>
            {bookMeta.title}
          </h1>
          <div className="w-24 h-1 bg-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-2xl text-gray-200 tracking-wider">By {bookMeta.author}</h2>
        </div>
      </div>
    </PdfPage>
  );

  const renderTitleAndCopyrightPage = (tpl) => (
    <PdfPage tpl={tpl} pageNumber={1}>
      <div className="flex-1 flex flex-col p-20" style={{ fontFamily: tpl === 'classic' ? 'serif' : tpl === 'technical' ? 'monospace' : 'sans-serif' }}>
        
        {/* Title Section (Top) */}
        <div className="flex flex-col items-center text-center mt-12">
          <h1 className={`text-5xl font-black mb-4 ${tpl === 'technical' ? 'text-blue-400' : 'text-slate-900'}`}>
            {bookMeta.title}
          </h1>
          <h2 className={`text-2xl font-light mb-8 ${tpl === 'technical' ? 'text-green-400' : 'text-slate-600'}`}>
            {bookMeta.subtitle}
          </h2>
          <h3 className={`text-xl font-bold ${tpl === 'technical' ? 'text-gray-300' : 'text-slate-800'}`}>
            {bookMeta.author}
          </h3>
        </div>
        
        <div className="flex-1"></div>
        
        {/* Copyright Section (Bottom) */}
        <div className="text-xs leading-relaxed mt-auto">
          <p className={`mb-3 font-bold ${tpl === 'technical' ? 'text-gray-300' : 'text-gray-800'}`}>
            Copyright © {bookMeta.publishedYear || new Date().getFullYear().toString()} by {bookMeta.author}
          </p>
          <p className={`mb-4 text-justify ${tpl === 'technical' ? 'text-gray-500' : 'text-gray-600'}`}>
            {bookMeta.copyrightText || 'All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.'}
          </p>
          
          <div className="mb-4 space-y-1">
            <p className={`mb-1 ${tpl === 'technical' ? 'text-gray-400' : 'text-gray-700'}`}><strong>Publisher:</strong> {bookMeta.publisher}</p>
            <p className={`mb-1 ${tpl === 'technical' ? 'text-gray-400' : 'text-gray-700'}`}><strong>Edition:</strong> {bookMeta.edition}</p>
            <p className={`mb-1 ${tpl === 'technical' ? 'text-gray-400' : 'text-gray-700'}`}><strong>ISBN:</strong> {bookMeta.isbn}</p>
          </div>
          
          <p className={`${tpl === 'technical' ? 'text-gray-600' : 'text-gray-400'}`}>
            Printed in the United States of America.
          </p>
        </div>

      </div>
    </PdfPage>
  );

  const renderIntro = (tpl) => (
    <PdfPage tpl={tpl} pageNumber={2}>
      <div className="flex-1 flex flex-col justify-center items-center text-center p-20">
        <h2 className={`text-4xl font-bold mb-12 ${tpl === 'technical' ? 'text-blue-400' : 'text-gray-800'}`}>Introduction</h2>
        <p className={`text-xl leading-relaxed max-w-2xl italic ${tpl === 'technical' ? 'text-gray-400' : 'text-gray-600 font-serif'}`}>
          "{bookMeta.intro}"
        </p>
      </div>
    </PdfPage>
  );

  const renderIndex = (tpl) => (
    <PdfPage tpl={tpl} pageNumber={3}>
      <div className="px-16 md:px-24 pt-16 pb-32 h-full overflow-hidden">
        <h2 className={`text-4xl font-extrabold mb-10 border-b-2 pb-4 inline-block ${tpl === 'technical' ? 'text-blue-400 border-blue-400' : 'text-gray-800 border-gray-800'}`}>Table of Contents</h2>
        <div className="space-y-4">
          {dummyBook.map(ch => (
            <div key={`index-${ch.id}`} className={`flex items-end justify-between border-b pb-2 ${tpl === 'technical' ? 'border-slate-700' : 'border-gray-300/50'}`}>
              <span className={`text-lg font-bold ${tpl === 'technical' ? 'text-gray-300' : 'text-gray-700'}`}>{ch.title}: {ch.subtitle}</span>
              {/* Note: In real app, these page numbers would be dynamically mapped to generated pages */}
              <span className={tpl === 'technical' ? 'text-green-400 font-bold' : 'text-emerald-600 font-bold'}>...</span>
            </div>
          ))}
        </div>
      </div>
    </PdfPage>
  );

  return (
    <div className="flex h-[calc(100vh-130px)] w-full bg-white text-gray-800 font-sans rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      
      {/* Sidebar: Template Selection */}
      <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full z-10 shrink-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50/80 backdrop-blur sticky top-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaPalette className="text-emerald-600 text-base" />
            Book Templates
          </h2>
          <p className="text-gray-500 text-xs mt-1">Select a design for your book</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          ) : (
            templates.map((tpl) => (
              <div 
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`relative p-2.5 rounded-xl cursor-pointer transition-all duration-200 border-2 overflow-hidden group hover:scale-[1.01] ${
                  selectedTemplate?.id === tpl.id 
                    ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-base transition-colors duration-300 shadow-sm border ${getTemplateIconClasses(tpl.id, selectedTemplate?.id === tpl.id)}`}>
                    {getTemplateIcon(tpl.id)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className={`font-bold text-sm truncate ${
                      selectedTemplate?.id === tpl.id ? 'text-emerald-700' : 'text-gray-800'
                    }`}>
                      {tpl.name}
                    </h3>
                    <p className="text-gray-500 text-[10px] leading-tight line-clamp-1">{tpl.description}</p>
                  </div>
                </div>
                {selectedTemplate?.id === tpl.id && (
                  <div className="absolute top-2 right-2 text-emerald-500 text-xs">
                    <FaCheckCircle />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content: Live PDF Viewer */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-200">
        
        <header className="px-6 py-4 flex justify-between items-center border-b border-gray-300 bg-white z-20 shadow-sm shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">PDF Viewer</h1>
            <p className="text-gray-500 text-xs mt-0.5">Showing distinct pages for <span className="text-emerald-600 font-semibold">{selectedTemplate?.name}</span> template</p>
          </div>
          <button className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <FaBookOpen />
            Use This Template
          </button>
        </header>

        {/* Scrollable Container with Grey Background (PDF Viewer Feel) */}
        <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center z-10 pb-32">
          {selectedTemplate && (
            <div className="w-full max-w-4xl">
              <AutoPaginator 
                dummyBook={dummyBook} 
                tpl={selectedTemplate.id} 
                renderCover={renderCover}
                renderTitleAndCopyrightPage={renderTitleAndCopyrightPage}
                renderIntro={renderIntro}
                renderIndex={renderIndex}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
