import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../config';
import { openImageInNewTab } from '../utils/imageViewer';
import {
  FaPalette, FaScroll, FaGraduationCap, FaWandMagicSparkles, FaLaptopCode,
  FaBolt, FaFloppyDisk, FaFilePdf, FaCheck, FaPaperclip, FaSpinner, FaBookOpen,
  FaListCheck, FaQuoteLeft, FaListOl, FaPlus, FaRotate, FaPenToSquare, FaArrowLeft,
  FaArrowsUpDown, FaChevronLeft, FaChevronRight, FaFileLines, FaMinus, FaChevronDown,
  FaFileWord, FaFileCode, FaSliders, FaEllipsisVertical, FaXmark,
  FaLightbulb, FaBullseye, FaPenNib, FaEllipsis, FaTrashCan, FaMagnifyingGlass,
  FaImage, FaCopy, FaEye, FaArrowUpRightFromSquare, FaPrint
} from 'react-icons/fa6';

const getTemplateIcon = (id) => {
  switch (id) {
    case 'modern': return <FaPalette className="text-indigo-600 text-base" />;
    case 'classic': return <FaScroll className="text-amber-600 text-base" />;
    case 'education': return <FaGraduationCap className="text-purple-600 text-base" />;
    case 'minimal': return <FaWandMagicSparkles className="text-sky-500 text-base" />;
    case 'technical': return <FaLaptopCode className="text-emerald-600 text-base" />;
    default: return <FaPalette className="text-indigo-600 text-base" />;
  }
};

const TEMPLATES = [
  { id: 'modern', name: 'Modern', desc: 'Gradient navy cover with modern clean styling' },
  { id: 'classic', name: 'Classic', desc: 'Serif fonts, gold ornaments & traditional layout' },
  { id: 'education', name: 'Education', desc: 'Student-friendly badges & colorful section cards' },
  { id: 'minimal', name: 'Minimal', desc: 'Swiss typography & distraction-free simplicity' },
  { id: 'technical', name: 'Technical', desc: 'Dark code-editor theme with monospace typography' }
];

export default function Step5Download({ book, formData, setFormData, bookId, onReset, onDownload }) {
  const [isEditMode, setIsEditMode] = useState(true); // Default to live edit mode enabled
  const [currentTemplate, setCurrentTemplate] = useState(formData.templateId || 'modern');
  const [editableBook, setEditableBook] = useState(book || null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageFormat, setPageFormat] = useState('A4');
  const [pageWidthMm, setPageWidthMm] = useState(210); // Standard A4: 210 mm
  const [pageHeightMm, setPageHeightMm] = useState(297); // Standard A4: 297 mm
  const [activeEditorField, setActiveEditorField] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' (Continuous Word Editor) | 'preview' (Exact Book Pages)
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [docSpacing, setDocSpacing] = useState('normal'); // 'compact' | 'normal' | 'relaxed'
  const bookContainerRef = useRef(null);

  // In-Editor AI Writing Assistant (Google Docs Floating Pill Bar)
  const [isAiBarVisible, setIsAiBarVisible] = useState(true); // Floating Google Docs bar visible
  const [showPillOptions, setShowPillOptions] = useState(false); // Quick action dropdown toggle
  const [aiPromptInput, setAiPromptInput] = useState(''); // Text in floating pill input
  const [aiAssistAction, setAiAssistAction] = useState('custom'); // 'custom' | 'expand' | 'rephrase' | 'examples' | 'generate_chapter'
  const [aiTargetChapterIdx, setAiTargetChapterIdx] = useState(0);
  const [aiTargetSectionIdx, setAiTargetSectionIdx] = useState(0);
  const [aiNewChapterTopic, setAiNewChapterTopic] = useState('');
  const [aiCustomPrompt, setAiCustomPrompt] = useState(''); // Store user's custom instruction
  const [aiGeneratedResult, setAiGeneratedResult] = useState(''); // Stores AI generated output for Google Docs preview/copy
  const [aiCopied, setAiCopied] = useState(false); // Copy status feedback
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAssistStatus, setAiAssistStatus] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPreviewingPDF, setIsPreviewingPDF] = useState(false);
  const [previewPdfBlobUrl, setPreviewPdfBlobUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const aiInputRef = useRef(null);

  // 6th Template: Style from Uploaded Reference Book
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
  const [customStyleConfig, setCustomStyleConfig] = useState(null);  // Gemini-analyzed style config
  const [customStyleCSS, setCustomStyleCSS] = useState('');          // Generated CSS from style analysis
  const [styleBookFileName, setStyleBookFileName] = useState('');    // Name of uploaded ref book
  const styleBookInputRef = useRef(null);

  // Sync initial book data
  useEffect(() => {
    if (book) {
      setEditableBook(JSON.parse(JSON.stringify(book)));
    }
  }, [book]);

  // Handle template selection
  const handleTemplateSelect = (tplId) => {
    setCurrentTemplate(tplId);
    if (setFormData) {
      setFormData(prev => ({ ...prev, templateId: tplId }));
    }
  };

  // ---- 6th Template: "Style from My Book" handler ----
  const handleStyleBookUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.pdf', '.txt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      alert('Only PDF or TXT files are supported for style analysis.');
      return;
    }

    setStyleBookFileName(file.name);
    setIsAnalyzingStyle(true);
    setCurrentTemplate('custom-style'); // Switch to custom style mode
    if (setFormData) {
      setFormData(prev => ({ ...prev, templateId: 'custom-style' }));
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/books/analyze-style`, {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Style analysis failed');
      }

      setCustomStyleConfig(data.styleConfig);
      setCustomStyleCSS(data.previewCSS);
      setSaveStatus(`✅ Style cloned from "${file.name}" — ${data.styleConfig.writingTone} tone, ${data.styleConfig.fontStyle} font!`);
      setTimeout(() => setSaveStatus(''), 5000);
    } catch (err) {
      console.error('Style analysis error:', err);
      setSaveStatus(`⚠️ Style analysis failed: ${err.message}`);
      setTimeout(() => setSaveStatus(''), 4000);
      setCurrentTemplate('modern'); // Fall back to modern
    } finally {
      setIsAnalyzingStyle(false);
      // Reset file input
      if (styleBookInputRef.current) styleBookInputRef.current.value = '';
    }
  };

  // Sync / Update Index Page (Table of Contents) from chapters
  const handleUpdateIndexPage = () => {
    if (!editableBook) return;
    const chapters = editableBook.chapters || [];
    const newTOC = chapters.map((ch, idx) => ({
      chapter: idx + 1,
      title: ch.title || `Chapter ${idx + 1}`
    }));

    setEditableBook(prev => ({
      ...prev,
      tableOfContents: newTOC
    }));

    setSaveStatus('📑 Index Page updated with all current chapters!');
    setTimeout(() => setSaveStatus(''), 3500);
  };

  // Word-style formatting actions (Bold, Italic, Underline)
  const formatDoc = (cmd) => {
    document.execCommand(cmd, false, null);
  };

  // Scroll to chapter on right side
  const scrollToChapter = (chIdx) => {
    const el = document.getElementById(`chapter-card-${chIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Blur handlers to update state
  const handleTitleBlur = (e) => {
    const text = e.currentTarget.innerText.trim();
    setEditableBook(prev => ({ ...prev, title: text }));
  };

  const handleAuthorBlur = (e) => {
    const text = e.currentTarget.innerText.trim();
    setEditableBook(prev => ({ ...prev, author: text }));
  };

  const handleCategoryBlur = (e) => {
    const text = e.currentTarget.innerText.trim();
    setEditableBook(prev => ({ ...prev, category: text }));
  };

  const handleChapterTitleBlur = (chIdx, e) => {
    const newTitle = e.currentTarget.innerText.trim();
    setEditableBook(prev => {
      const updatedChapters = [...(prev.chapters || [])];
      updatedChapters[chIdx] = { ...updatedChapters[chIdx], title: newTitle };

      // Auto update TOC entry
      const updatedTOC = [...(prev.tableOfContents || [])];
      if (updatedTOC[chIdx]) {
        updatedTOC[chIdx] = { ...updatedTOC[chIdx], title: newTitle };
      }

      return {
        ...prev,
        chapters: updatedChapters,
        tableOfContents: updatedTOC
      };
    });
  };

  const handleChapterSummaryBlur = (chIdx, e) => {
    const html = e.currentTarget.innerHTML;
    setEditableBook(prev => {
      const updatedChapters = [...(prev.chapters || [])];
      updatedChapters[chIdx] = { ...updatedChapters[chIdx], summary: html };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleSectionHeadingBlur = (chIdx, secIdx, e) => {
    const text = e.currentTarget.innerText.trim();
    setEditableBook(prev => {
      const updatedChapters = [...(prev.chapters || [])];
      const updatedSections = [...(updatedChapters[chIdx].sections || [])];
      updatedSections[secIdx] = { ...updatedSections[secIdx], heading: text };
      updatedChapters[chIdx] = { ...updatedChapters[chIdx], sections: updatedSections };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleSectionContentBlur = (chIdx, secIdx, e) => {
    // Aggregate all chunks if this section was split across multiple pages
    const chunkEls = document.querySelectorAll(
      `.section-body-content[data-ch-idx="${chIdx}"][data-sec-idx="${secIdx}"]`
    );
    let fullHtml = '';
    if (chunkEls.length > 1) {
      fullHtml = Array.from(chunkEls).map(chEl => {
        if (chEl === e.currentTarget) return e.currentTarget.innerHTML;
        return chEl.innerHTML;
      }).join('');
    } else {
      fullHtml = e.currentTarget.innerHTML;
    }

    setEditableBook(prev => {
      const updatedChapters = [...(prev.chapters || [])];
      const updatedSections = [...(updatedChapters[chIdx].sections || [])];
      updatedSections[secIdx] = { ...updatedSections[secIdx], content: fullHtml };
      updatedChapters[chIdx] = { ...updatedChapters[chIdx], sections: updatedSections };
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleTOCItemBlur = (tocIdx, e) => {
    const text = e.currentTarget.innerText.trim();
    setEditableBook(prev => {
      const updatedTOC = [...(prev.tableOfContents || [])];
      if (updatedTOC[tocIdx]) {
        updatedTOC[tocIdx] = { ...updatedTOC[tocIdx], title: text };
      }
      return { ...prev, tableOfContents: updatedTOC };
    });
  };

  // TinyMCE Inline Editor Lifecycle & Real-time State Synchronization
  useEffect(() => {
    if (!isEditMode) {
      if (window.tinymce) {
        try {
          window.tinymce.remove('.tinymce-editable');
        } catch (err) {
          // ignore cleanup errors
        }
      }
      setActiveEditorField(null);
      return;
    }

    const initTiny = () => {
      if (!window.tinymce) return;

      try {
        window.tinymce.remove('.tinymce-editable');
      } catch (err) {
        // ignore removal errors
      }

      // Clear any stale toolbars from ribbon container before fresh init
      const ribbon = document.getElementById('ms-word-ribbon-container');
      if (ribbon) {
        const oldToolbars = ribbon.querySelectorAll('.tox-tinymce-inline');
        oldToolbars.forEach(tb => tb.remove());
      }

      window.tinymce.init({
        selector: '.tinymce-editable',
        inline: true,
        fixed_toolbar_container: '#ms-word-ribbon-container',
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime',
          'table', 'wordcount', 'pagebreak'
        ],
        toolbar: [
          'undo redo | blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify',
          'bullist numlist outdent indent | subscript superscript | table link image charmap hr | removeformat'
        ],
        font_family_formats: 'Inter=Inter,sans-serif; Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Georgia=georgia,palatino,serif; Courier New=courier new,courier,monospace; Roboto=roboto,sans-serif; Helvetica=helvetica,sans-serif',
        font_size_formats: '9pt 10pt 11pt 12pt 13pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt',
        line_height_formats: '1 1.15 1.25 1.5 1.75 2',
        toolbar_mode: 'wrap',
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: (cb) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.onchange = function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
              const id = 'blobid' + (new Date()).getTime();
              const blobCache = window.tinymce.activeEditor?.editorUpload?.blobCache;
              const base64 = reader.result.split(',')[1];
              if (blobCache) {
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);
                cb(blobInfo.blobUri(), { title: file.name });
              } else {
                cb(reader.result, { title: file.name });
              }
            };
            reader.readAsDataURL(file);
          };
          input.click();
        },
        setup: (editor) => {
          editor.on('init', () => {
            const makeInitialVisible = () => {
              const r = document.getElementById('ms-word-ribbon-container');
              if (!r) return;
              const hasActive = r.querySelector('.tinymce-active-toolbar');
              if (!hasActive) {
                const firstTb = editor.editorContainer || r.querySelector('.tox-tinymce-inline');
                if (firstTb) {
                  firstTb.classList.add('tinymce-active-toolbar');
                  firstTb.style.setProperty('display', 'block', 'important');
                  firstTb.style.setProperty('opacity', '1', 'important');
                  firstTb.style.setProperty('pointer-events', 'auto', 'important');
                  firstTb.style.setProperty('z-index', '10', 'important');
                  r.classList.add('has-active-toolbar');
                }
              }
            };
            makeInitialVisible();
            setTimeout(makeInitialVisible, 30);
            setTimeout(makeInitialVisible, 120);
          });
          editor.on('focus', () => {
            const el = editor.getElement();
            const field = el?.getAttribute('data-field-type') || 'text';
            const cIdxAttr = el?.getAttribute('data-ch-idx');
            const sIdxAttr = el?.getAttribute('data-sec-idx');
            if (cIdxAttr !== null && cIdxAttr !== undefined && !isNaN(parseInt(cIdxAttr, 10))) {
              setAiTargetChapterIdx(parseInt(cIdxAttr, 10));
            }
            if (sIdxAttr !== null && sIdxAttr !== undefined && !isNaN(parseInt(sIdxAttr, 10))) {
              setAiTargetSectionIdx(parseInt(sIdxAttr, 10));
            }
            setActiveEditorField(field);

            const activateCurrent = () => {
              const r = document.getElementById('ms-word-ribbon-container');
              if (!r) return;
              r.classList.add('has-active-toolbar');
              const allToolbars = r.querySelectorAll('.tox-tinymce-inline');
              allToolbars.forEach(tb => {
                if (editor.editorContainer && tb === editor.editorContainer) {
                  tb.classList.add('tinymce-active-toolbar');
                  tb.style.setProperty('display', 'block', 'important');
                  tb.style.setProperty('opacity', '1', 'important');
                  tb.style.setProperty('pointer-events', 'auto', 'important');
                  tb.style.setProperty('z-index', '10', 'important');
                } else {
                  tb.classList.remove('tinymce-active-toolbar');
                  tb.style.setProperty('display', 'none', 'important');
                  tb.style.setProperty('opacity', '0', 'important');
                  tb.style.setProperty('pointer-events', 'none', 'important');
                  tb.style.setProperty('z-index', '1', 'important');
                }
              });
            };

            activateCurrent();
            setTimeout(activateCurrent, 10);
            setTimeout(activateCurrent, 60);
          });
          editor.on('blur', () => {
            const el = editor.getElement();
            if (!el) return;
            const fieldType = el.getAttribute('data-field-type');
            const chIdx = el.getAttribute('data-ch-idx');
            const secIdx = el.getAttribute('data-sec-idx');

            if (fieldType === 'sec-content') {
              const cIdx = parseInt(chIdx, 10);
              const sIdx = parseInt(secIdx, 10);
              const chunkEls = document.querySelectorAll(
                `.section-body-content[data-ch-idx="${cIdx}"][data-sec-idx="${sIdx}"]`
              );
              let fullHtml = '';
              if (chunkEls.length > 1) {
                fullHtml = Array.from(chunkEls).map(chEl => {
                  if (chEl === el) return editor.getContent();
                  return chEl.innerHTML;
                }).join('');
              } else {
                fullHtml = editor.getContent();
              }

              setEditableBook(prev => {
                const chapters = [...(prev.chapters || [])];
                if (chapters[cIdx]?.sections?.[sIdx]) {
                  const sections = [...chapters[cIdx].sections];
                  sections[sIdx] = { ...sections[sIdx], content: fullHtml };
                  chapters[cIdx] = { ...chapters[cIdx], sections };
                }
                return { ...prev, chapters };
              });
            } else if (fieldType === 'sec-heading') {
              const cIdx = parseInt(chIdx, 10);
              const sIdx = parseInt(secIdx, 10);
              const text = editor.getContent({ format: 'text' }).trim();
              setEditableBook(prev => {
                const chapters = [...(prev.chapters || [])];
                if (chapters[cIdx]?.sections?.[sIdx]) {
                  const sections = [...chapters[cIdx].sections];
                  sections[sIdx] = { ...sections[sIdx], heading: text };
                  chapters[cIdx] = { ...chapters[cIdx], sections };
                }
                return { ...prev, chapters };
              });
            } else if (fieldType === 'ch-title') {
              const cIdx = parseInt(chIdx, 10);
              const text = editor.getContent({ format: 'text' }).trim();
              setEditableBook(prev => {
                const chapters = [...(prev.chapters || [])];
                if (chapters[cIdx]) chapters[cIdx] = { ...chapters[cIdx], title: text };
                const toc = [...(prev.tableOfContents || [])];
                if (toc[cIdx]) toc[cIdx] = { ...toc[cIdx], title: text };
                return { ...prev, chapters, tableOfContents: toc };
              });
            } else if (fieldType === 'ch-summary') {
              const cIdx = parseInt(chIdx, 10);
              const html = editor.getContent();
              setEditableBook(prev => {
                const chapters = [...(prev.chapters || [])];
                if (chapters[cIdx]) chapters[cIdx] = { ...chapters[cIdx], summary: html };
                return { ...prev, chapters };
              });
            } else if (fieldType === 'title') {
              const text = editor.getContent({ format: 'text' }).trim();
              setEditableBook(prev => ({ ...prev, title: text }));
            } else if (fieldType === 'author') {
              const text = editor.getContent({ format: 'text' }).trim();
              setEditableBook(prev => ({ ...prev, author: text }));
            } else if (fieldType === 'category') {
              const text = editor.getContent({ format: 'text' }).trim();
              setEditableBook(prev => ({ ...prev, category: text }));
            }
          });
        }
      });
    };

    let timer = null;
    let interval = null;

    if (window.tinymce) {
      timer = setTimeout(initTiny, 300);
    } else {
      interval = setInterval(() => {
        if (window.tinymce) {
          clearInterval(interval);
          initTiny();
        }
      }, 200);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
      if (window.tinymce) {
        try {
          window.tinymce.remove('.tinymce-editable');
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [isEditMode, currentTemplate, editableBook?.chapters?.length, viewMode, selectedChapterIdx]);

  // Add section
  const handleAddSection = (chIdx) => {
    setEditableBook(prev => {
      const updatedChapters = [...(prev.chapters || [])];
      const sections = updatedChapters[chIdx].sections || [];
      updatedChapters[chIdx] = {
        ...updatedChapters[chIdx],
        sections: [
          ...sections,
          { heading: `New Heading ${sections.length + 1}`, content: 'Click here to type section content...' }
        ]
      };
      return { ...prev, chapters: updatedChapters };
    });
  };

  // Delete section
  const handleDeleteSection = (chIdx, secIdx) => {
    setEditableBook(prev => {
      const updatedChapters = [...(prev.chapters || [])];
      const sections = updatedChapters[chIdx].sections.filter((_, i) => i !== secIdx);
      updatedChapters[chIdx] = { ...updatedChapters[chIdx], sections };
      return { ...prev, chapters: updatedChapters };
    });
  };

  // Add chapter
  const handleAddChapter = () => {
    setEditableBook(prev => {
      const chapters = prev.chapters || [];
      const newNum = chapters.length + 1;
      const newChapter = {
        chapterNumber: newNum,
        title: `Chapter ${newNum}: New Chapter Title`,
        summary: 'Brief overview of this chapter',
        sections: [
          { heading: 'Introduction', content: 'Type your chapter content here...' }
        ]
      };
      const updatedChapters = [...chapters, newChapter];
      const updatedTOC = updatedChapters.map((ch, idx) => ({
        chapter: idx + 1,
        title: ch.title
      }));

      return {
        ...prev,
        chapters: updatedChapters,
        tableOfContents: updatedTOC
      };
    });
    setSelectedChapterIdx((editableBook.chapters || []).length);
    // Scroll to new chapter after state updates
    setTimeout(() => {
      const idx = (editableBook.chapters || []).length;
      scrollToChapter(idx);
    }, 100);
  };

  // Delete chapter
  const handleDeleteChapter = (chIdx) => {
    if ((editableBook.chapters || []).length <= 1) {
      alert('Book must have at least one chapter');
      return;
    }
    setEditableBook(prev => {
      const filtered = prev.chapters.filter((_, i) => i !== chIdx);
      const reindexed = filtered.map((ch, idx) => ({
        ...ch,
        chapterNumber: idx + 1
      }));
      const updatedTOC = reindexed.map((ch, idx) => ({
        chapter: idx + 1,
        title: ch.title
      }));
      return {
        ...prev,
        chapters: reindexed,
        tableOfContents: updatedTOC
      };
    });
    setSelectedChapterIdx(prev => Math.max(0, prev >= chIdx ? prev - 1 : prev));
  };

  // Save book changes
  const handleSaveBook = async () => {
    setIsSaving(true);
    setSaveStatus('');
    try {
      if (bookId) {
        await axios.put(`${API}/books/${bookId}`, {
          structuredContent: editableBook,
          templateId: currentTemplate,
          title: editableBook.title,
          author: editableBook.author,
          coverImage: editableBook.coverImage
        });
      }
      setSaveStatus('✅ Book saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Error saving book:', err);
      setSaveStatus('❌ Error saving: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Update spacing (gap) for a specific section
  const handleUpdateSectionSpacing = (chIdx, secIdx, newSpacing) => {
    const safeGap = Math.max(0, Math.min(80, Number(newSpacing) || 0));
    setEditableBook(prev => {
      const chapters = [...(prev.chapters || [])];
      if (chapters[chIdx]?.sections?.[secIdx]) {
        const sections = [...chapters[chIdx].sections];
        sections[secIdx] = {
          ...sections[secIdx],
          spacing: safeGap
        };
        chapters[chIdx] = { ...chapters[chIdx], sections };
      }
      return { ...prev, chapters };
    });
    setSaveStatus(`📏 Section gap: ${safeGap}px (re-calculating pages...)`);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Instant Page Recalculation and Balance
  const handleSyncPages = () => {
    if (window.tinymce && window.tinymce.activeEditor) {
      const activeEd = window.tinymce.activeEditor;
      const el = activeEd.getElement();
      if (el) {
        const fieldType = el.getAttribute('data-field-type');
        const chIdx = parseInt(el.getAttribute('data-ch-idx'), 10);
        const secIdx = parseInt(el.getAttribute('data-sec-idx'), 10);
        if (fieldType === 'sec-content') {
          const chunkEls = document.querySelectorAll(
            `.section-body-content[data-ch-idx="${chIdx}"][data-sec-idx="${secIdx}"]`
          );
          let fullHtml = '';
          if (chunkEls.length > 1) {
            fullHtml = Array.from(chunkEls).map(chEl => (chEl === el ? activeEd.getContent() : chEl.innerHTML)).join('');
          } else {
            fullHtml = activeEd.getContent();
          }
          setEditableBook(prev => {
            const chapters = [...(prev.chapters || [])];
            if (chapters[chIdx]?.sections?.[secIdx]) {
              const sections = [...chapters[chIdx].sections];
              sections[secIdx] = { ...sections[secIdx], content: fullHtml };
              chapters[chIdx] = { ...chapters[chIdx], sections };
            }
            return { ...prev, chapters };
          });
        }
      }
    } else {
      setEditableBook(prev => ({ ...prev }));
    }
    setSaveStatus('⚡ Pages re-calculated and balanced!');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Preset selection handler
  const handleSelectPreset = (presetId) => {
    setPageFormat(presetId);
    if (presetId === 'A4') {
      setPageWidthMm(210);
      setPageHeightMm(297);
    } else if (presetId === 'A5') {
      setPageWidthMm(148);
      setPageHeightMm(210);
    } else if (presetId === 'Letter') {
      setPageWidthMm(216);
      setPageHeightMm(279);
    } else if (presetId === 'Novel') {
      setPageWidthMm(152);
      setPageHeightMm(229);
    } else if (presetId === 'Digest') {
      setPageWidthMm(140);
      setPageHeightMm(216);
    }
  };

  // Direct dimension change handlers
  const handleWidthChange = (val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPageWidthMm(num);
      setPageFormat('Custom');
    } else if (val === '') {
      setPageWidthMm('');
      setPageFormat('Custom');
    }
  };

  const handleHeightChange = (val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPageHeightMm(num);
      setPageFormat('Custom');
    } else if (val === '') {
      setPageHeightMm('');
      setPageFormat('Custom');
    }
  };

  // Reset to Standard PDF dimensions (210 x 297 mm)
  const handleResetToStandardPDF = () => {
    setPageFormat('A4');
    setPageWidthMm(210);
    setPageHeightMm(297);
  };

  // Download PDF with custom dimensions
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Ensure any active TinyMCE edits are synced into state
      if (window.tinymce && window.tinymce.activeEditor) {
        const activeEd = window.tinymce.activeEditor;
        const el = activeEd.getElement();
        if (el) {
          const fieldType = el.getAttribute('data-field-type');
          const chIdx = parseInt(el.getAttribute('data-ch-idx'), 10);
          const secIdx = parseInt(el.getAttribute('data-sec-idx'), 10);
          if (fieldType === 'sec-content') {
            const chunkEls = document.querySelectorAll(
              `.section-body-content[data-ch-idx="${chIdx}"][data-sec-idx="${secIdx}"]`
            );
            let fullHtml = '';
            if (chunkEls.length > 1) {
              fullHtml = Array.from(chunkEls).map(chEl => (chEl === el ? activeEd.getContent() : chEl.innerHTML)).join('');
            } else {
              fullHtml = activeEd.getContent();
            }
            if (editableBook?.chapters?.[chIdx]?.sections?.[secIdx]) {
              editableBook.chapters[chIdx].sections[secIdx].content = fullHtml;
            }
          }
        }
      }

      const bookToExport = {
        ...editableBook,
        docSpacing
      };

      if (onDownload) {
        await onDownload(bookToExport, currentTemplate, {
          width: Number(pageWidthMm) || 210,
          height: Number(pageHeightMm) || 297
        }, currentTemplate === 'custom-style' ? customStyleCSS : null);
      }
    } finally {
      setIsDownloading(false);
      setShowExportMenu(false);
    }
  };

  // Generate and Live Preview real A4 PDF in high-fidelity modal or new tab
  const handlePreviewRealPDF = async (openInNewTab = false) => {
    setIsPreviewingPDF(true);
    setSaveStatus('🔄 Generating real A4 PDF for live preview...');
    try {
      // 1. Ensure any active TinyMCE edits are synced into state
      if (window.tinymce && window.tinymce.activeEditor) {
        const activeEd = window.tinymce.activeEditor;
        const el = activeEd.getElement();
        if (el) {
          const fieldType = el.getAttribute('data-field-type');
          const chIdx = parseInt(el.getAttribute('data-ch-idx'), 10);
          const secIdx = parseInt(el.getAttribute('data-sec-idx'), 10);
          if (fieldType === 'sec-content') {
            const chunkEls = document.querySelectorAll(
              `.section-body-content[data-ch-idx="${chIdx}"][data-sec-idx="${secIdx}"]`
            );
            let fullHtml = '';
            if (chunkEls.length > 1) {
              fullHtml = Array.from(chunkEls).map(chEl => (chEl === el ? activeEd.getContent() : chEl.innerHTML)).join('');
            } else {
              fullHtml = activeEd.getContent();
            }
            if (editableBook?.chapters?.[chIdx]?.sections?.[secIdx]) {
              editableBook.chapters[chIdx].sections[secIdx].content = fullHtml;
            }
          }
        }
      }

      const bookToExport = {
        ...editableBook,
        docSpacing
      };

      const effectiveCSS = (currentTemplate === 'custom-style' ? customStyleCSS : null);

      const response = await axios.post(`${API}/books/${bookId}/generate-pdf`, {
        structuredContent: bookToExport,
        templateId: currentTemplate,
        pageDimensions: {
          width: Number(pageWidthMm) || 210,
          height: Number(pageHeightMm) || 297
        },
        ...(effectiveCSS ? { customCSS: effectiveCSS } : {})
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (openInNewTab) {
        window.open(url, '_blank');
        setSaveStatus('✅ Real PDF opened in new browser tab!');
      } else {
        setPreviewPdfBlobUrl(url);
        setShowPdfModal(true);
        setSaveStatus('✅ Real A4 PDF preview ready!');
      }
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('PDF preview error:', err);
      alert('Error creating PDF preview: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPreviewingPDF(false);
      setShowExportMenu(false);
    }
  };

  // Download Word Document (.doc)
  const handleDownloadWord = () => {
    const bookTitle = editableBook?.title || 'My_Book';
    const author = editableBook?.author || 'Author';
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${bookTitle}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; }
          h1 { font-size: 26pt; color: #1e3a8a; text-align: center; margin-top: 40pt; }
          h2 { font-size: 18pt; color: #0f172a; margin-top: 24pt; border-bottom: 2pt solid #6366f1; padding-bottom: 4pt; }
          h3 { font-size: 13pt; color: #334155; margin-top: 10pt; margin-bottom: 4pt; }
          p { margin-bottom: 8pt; text-align: justify; }
          p:last-child { margin-bottom: 0 !important; }
          ul, ol { margin-left: 20pt; margin-bottom: 8pt; }
          .cover { text-align: center; padding-top: 100pt; page-break-after: always; }
          .toc { page-break-after: always; margin-top: 20pt; }
          .chapter { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>${bookTitle}</h1>
          <p style="font-size: 15pt; color: #64748b; margin-top: 15pt;">Written by ${author}</p>
        </div>
        <div class="toc">
          <h2>Table of Contents</h2>
          <ul>
            ${(editableBook?.tableOfContents || []).map(t => `<li>Chapter ${t.chapter}: ${t.title}</li>`).join('')}
          </ul>
        </div>
        ${(editableBook?.chapters || []).map(ch => `
          <div class="chapter">
            <h2>Chapter ${ch.chapterNumber}: ${ch.title}</h2>
            ${ch.summary ? `<p style="font-style: italic; color: #64748b; background: #f8fafc; padding: 8pt;">${ch.summary}</p>` : ''}
            ${(ch.sections || []).map(sec => {
              const secGap = getSectionGap(sec);
              return `
              <div class="section" style="margin-bottom: ${secGap}px;">
                <h3>${sec.heading || ''}</h3>
                <div>${sec.content || ''}</div>
              </div>
            `;}).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Download Markdown / Plain Text
  const handleDownloadMarkdown = () => {
    const bookTitle = editableBook?.title || 'My_Book';
    const author = editableBook?.author || 'Author';
    let md = `# ${bookTitle}\n**Author:** ${author}\n\n---\n\n## Table of Contents\n\n`;
    (editableBook?.tableOfContents || []).forEach(t => {
      md += `- Chapter ${t.chapter}: ${t.title}\n`;
    });
    md += '\n---\n\n';
    (editableBook?.chapters || []).forEach(ch => {
      md += `## Chapter ${ch.chapterNumber}: ${ch.title}\n\n`;
      if (ch.summary) {
        md += `*${ch.summary.replace(/<[^>]+>/g, '')}*\n\n`;
      }
      (ch.sections || []).forEach(sec => {
        md += `### ${sec.heading || ''}\n\n`;
        const textContent = (sec.content || '')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<li>/gi, '- ')
          .replace(/<\/li>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .trim();
        md += `${textContent}\n\n`;
      });
      md += '---\n\n';
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Open AI Assistant directly locked to a specific section (Google Docs style)
  const handleOpenSectionAi = (chIdx, secIdx) => {
    setAiTargetChapterIdx(chIdx);
    setAiTargetSectionIdx(secIdx);
    setIsAiBarVisible(true);
    setAiGeneratedResult('');
    setAiCopied(false);
    setAiAssistStatus('');
    setTimeout(() => {
      aiInputRef.current?.focus();
    }, 150);
  };

  // Google Docs Floating Bar & AI Assistant Submit
  const handleFloatingBarSubmit = async (overrideAction = null, overridePrompt = null) => {
    const promptText = overridePrompt !== null ? overridePrompt : aiPromptInput.trim();
    const actionToRun = overrideAction || (promptText ? 'custom' : aiAssistAction);

    setIsAiProcessing(true);
    setAiAssistStatus('Gemini is crafting content...');
    try {
      const chapters = editableBook?.chapters || [];
      const currentChapter = chapters[aiTargetChapterIdx] || chapters[0];
      const currentSection = currentChapter?.sections?.[aiTargetSectionIdx] || currentChapter?.sections?.[0];

      let contentToSend = '';
      const context = {
        bookTitle: editableBook?.title || formData?.title,
        language: formData?.language || 'English',
        chapterTitle: currentChapter?.title,
        sectionHeading: currentSection?.heading,
        chapterNumber: (chapters.length + 1),
        ...(actionToRun === 'custom' ? { customPrompt: promptText || 'Improve, expand and polish this section.' } : {})
      };

      if (actionToRun === 'generate_chapter') {
        contentToSend = promptText || aiNewChapterTopic.trim() || 'Next Chapter Insights & Strategies';
        context.chapterNumber = chapters.length + 1;
      } else {
        contentToSend = currentSection?.content || '';
      }

      const res = await axios.post(`${API}/books/ai-assist`, {
        action: actionToRun,
        content: contentToSend,
        context
      });

      if (actionToRun === 'generate_chapter') {
        const newCh = res.data.data;
        if (newCh) {
          setEditableBook(prev => {
            const updatedChs = [...(prev.chapters || []), newCh];
            const updatedTOC = updatedChs.map((c, i) => ({ chapter: i + 1, title: c.title }));
            return { ...prev, chapters: updatedChs, tableOfContents: updatedTOC };
          });
          setSelectedChapterIdx(chapters.length);
          setAiPromptInput('');
          setAiGeneratedResult('');
          setSaveStatus(`✨ Chapter "${newCh.title}" created with AI!`);
          setTimeout(() => setSaveStatus(''), 4000);
        }
      } else {
        const updatedContent = res.data.content;
        if (updatedContent) {
          setAiGeneratedResult(updatedContent);
          setAiAssistStatus('✨ Ready! Review, copy, or replace below:');
        }
      }
    } catch (err) {
      alert('AI Assistant error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Google Docs-style Apply & Replace in Section
  const handleApplyAiToSection = (mode = 'replace') => {
    if (!aiGeneratedResult) return;
    const chapters = editableBook?.chapters || [];
    const currentSection = chapters[aiTargetChapterIdx]?.sections?.[aiTargetSectionIdx];
    const existingContent = currentSection?.content || '';
    const finalContent = mode === 'replace' ? aiGeneratedResult : `${existingContent}\n${aiGeneratedResult}`;

    // 1. Update React state
    setEditableBook(prev => {
      const updatedChs = [...(prev.chapters || [])];
      if (updatedChs[aiTargetChapterIdx]?.sections?.[aiTargetSectionIdx]) {
        const sections = [...updatedChs[aiTargetChapterIdx].sections];
        sections[aiTargetSectionIdx] = {
          ...sections[aiTargetSectionIdx],
          content: finalContent
        };
        updatedChs[aiTargetChapterIdx] = { ...updatedChs[aiTargetChapterIdx], sections };
      }
      return { ...prev, chapters: updatedChs };
    });

    // 2. Direct DOM & TinyMCE sync for immediate visual feedback
    const chunkEls = document.querySelectorAll(
      `.section-body-content[data-ch-idx="${aiTargetChapterIdx}"][data-sec-idx="${aiTargetSectionIdx}"]`
    );
    chunkEls.forEach(el => {
      el.innerHTML = finalContent;
      if (window.tinymce) {
        const ed = window.tinymce.get(el.id) || (window.tinymce.activeEditor?.getElement() === el ? window.tinymce.activeEditor : null);
        if (ed && ed.setContent) {
          try { ed.setContent(finalContent); } catch (e) {}
        }
      }
    });

    setAiGeneratedResult('');
    setAiPromptInput('');
    setSaveStatus(mode === 'replace' ? '✨ Section replaced with AI content!' : '➕ AI content inserted below!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  // Google Docs-style Copy to Clipboard
  const handleCopyAiResult = () => {
    if (!aiGeneratedResult) return;
    const plainText = aiGeneratedResult.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    navigator.clipboard.writeText(plainText || aiGeneratedResult).then(() => {
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2500);
    }).catch(err => {
      console.error('Clipboard copy error:', err);
    });
  };

  // Dynamic page dimensions calculation (96 DPI conversion: 1mm ≈ 3.78px)
  const safeWidthMm = Math.max(50, Math.min(800, Number(pageWidthMm) || 210));
  const safeHeightMm = Math.max(50, Math.min(1200, Number(pageHeightMm) || 297));
  const isStandardA4 = Number(pageWidthMm) === 210 && Number(pageHeightMm) === 297;
  const dynamicWidthPx = Math.round(safeWidthMm * 3.78);
  const dynamicMinHeightPx = Math.round(safeHeightMm * 3.78);
  const dynamicAspectRatio = `${safeWidthMm} / ${safeHeightMm}`;

  // Helper for Roman numerals for Front Matter (TOC) pages
  const toRoman = (num) => {
    const romanMap = [
      { val: 1000, sym: 'm' }, { val: 900, sym: 'cm' }, { val: 500, sym: 'd' }, { val: 400, sym: 'cd' },
      { val: 100, sym: 'c' }, { val: 90, sym: 'xc' }, { val: 50, sym: 'l' }, { val: 40, sym: 'xl' },
      { val: 10, sym: 'x' }, { val: 9, sym: 'ix' }, { val: 5, sym: 'v' }, { val: 4, sym: 'iv' }, { val: 1, sym: 'i' }
    ];
    let res = '';
    let n = num;
    for (const { val, sym } of romanMap) {
      while (n >= val) {
        res += sym;
        n -= val;
      }
    }
    return res || 'i';
  };

  // Helper to extract top-level block elements from HTML for multi-page flow
  const extractBlocks = (html) => {
    if (!html || !html.trim()) return ['<p></p>'];

    const cleanHtml = html.trim();
    const hasBlocks = /<(p|ul|ol|blockquote|table|h[1-6]|pre|div)\b/i.test(cleanHtml);
    if (!hasBlocks) {
      const parts = cleanHtml.split(/\n\n+|<br\s*\/?>\s*<br\s*\/?>/i);
      return parts.map(p => `<p>${p.trim()}</p>`);
    }

    const blockRegex = /<(p|ul|ol|blockquote|table|h[1-6]|pre|div)\b[^>]*>[\s\S]*?<\/\1>/gi;
    const matches = cleanHtml.match(blockRegex);
    if (matches && matches.length > 0) {
      return matches;
    }
    return [cleanHtml];
  };

  // Realistic height estimation for an individual HTML block
  const estimateBlockHeight = (blockHtml) => {
    if (!blockHtml) return 24;
    const isList = /<(ul|ol)\b/i.test(blockHtml);
    if (isList) {
      const liMatches = blockHtml.match(/<li\b[^>]*>/gi);
      const liCount = liMatches ? liMatches.length : 1;
      return liCount * 28 + 16;
    }
    const isTable = /<table\b/i.test(blockHtml);
    if (isTable) {
      const trMatches = blockHtml.match(/<tr\b[^>]*>/gi);
      const trCount = trMatches ? trMatches.length : 1;
      return trCount * 36 + 20;
    }
    const isQuote = /<blockquote\b/i.test(blockHtml);
    if (isQuote) {
      const cleanText = blockHtml.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      const lines = Math.max(1, Math.ceil(cleanText.length / 75));
      return lines * 26 + 32;
    }

    // Standard paragraph or div
    const cleanText = blockHtml.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const textLen = cleanText.length;
    // Empty paragraph (<p><br></p> or Enter pressed)
    if (textLen === 0) return 28;
    const lines = Math.max(1, Math.ceil(textLen / 78));
    return lines * 24 + 10; // 24px line height + 10px margin-bottom
  };

  // Get dynamic gap for a specific section (custom per-section or docSpacing preset)
  const getSectionGap = (sec) => {
    if (typeof sec?.spacing === 'number') return sec.spacing;
    if (docSpacing === 'compact') return 12;
    if (docSpacing === 'relaxed') return 30;
    return 20; // Default normal gap
  };

  // Realistic total height estimation for a section
  const estimateSectionHeight = (sec) => {
    const headingHeight = sec.heading ? 34 : 0;
    const blocks = extractBlocks(sec.content || '');
    const contentHeight = blocks.reduce((acc, b) => acc + estimateBlockHeight(b), 0);
    const secGap = getSectionGap(sec);
    return headingHeight + contentHeight + secGap;
  };

  // Paginate sections into fixed-height page sheets with MS Word-style auto-continuation
  const paginateSections = (sections, availP1, availSubseq) => {
    if (!sections || sections.length === 0) return [[]];
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    let isPage1 = true;

    sections.forEach((sec, secIdx) => {
      const secGap = getSectionGap(sec);
      const maxAllowed = isPage1 ? availP1 : availSubseq;
      const headingH = sec.heading ? 34 : 0;
      const blocks = extractBlocks(sec.content || '<p></p>');
      const blockHeights = blocks.map(estimateBlockHeight);
      const totalSecContentH = blockHeights.reduce((a, b) => a + b, 0);
      const totalSecH = headingH + totalSecContentH + secGap;

      // Case 1: The entire section fits comfortably in the remaining space of currentPage
      if (currentHeight + totalSecH <= maxAllowed) {
        currentPage.push({
          section: sec,
          originalIndex: secIdx,
          isContinuation: false,
          chunkIdx: 0
        });
        currentHeight += totalSecH;
        return;
      }

      // Case 2: The entire section does NOT fit in remaining space.
      // Can it fit partially (heading + at least 1 block) on currentPage?
      const minFirstChunkH = headingH + (blockHeights[0] || 24);
      const canFitPartiallyOnCurrent = (currentHeight + minFirstChunkH <= maxAllowed);

      // If currentPage already has content and CANNOT even fit heading + 1 block, start a fresh page
      if (currentPage.length > 0 && !canFitPartiallyOnCurrent) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
        isPage1 = false;
      }

      // On whatever page we now are (current or fresh):
      // Check if the entire section fits here
      const effectiveMax = isPage1 ? availP1 : availSubseq;
      if (currentHeight + totalSecH <= effectiveMax) {
        currentPage.push({
          section: sec,
          originalIndex: secIdx,
          isContinuation: false,
          chunkIdx: 0
        });
        currentHeight += totalSecH;
        return;
      }

      // Case 3: Split blocks across pages like Word / Google Docs
      let remainingBlocks = [...blocks];
      let remainingHeights = [...blockHeights];
      let chunkIdx = 0;

      while (remainingBlocks.length > 0) {
        const curMax = isPage1 ? availP1 : availSubseq;
        const curHeadingH = chunkIdx === 0 ? headingH : 26;
        let chunkBlocks = [];
        let chunkH = curHeadingH + (remainingBlocks.length === 1 ? secGap : 4);

        // If currentPage already has content and cannot hold heading + at least 1 block, start next page
        if (currentPage.length > 0 && currentHeight + curHeadingH + (remainingHeights[0] || 24) > curMax) {
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          isPage1 = false;
        }

        const pageCapacity = isPage1 ? availP1 : availSubseq;

        // Collect blocks that fit onto this page sheet
        while (
          remainingBlocks.length > 0 &&
          (chunkBlocks.length === 0 || currentHeight + chunkH + remainingHeights[0] <= pageCapacity)
        ) {
          chunkBlocks.push(remainingBlocks.shift());
          chunkH += remainingHeights.shift();
        }

        currentPage.push({
          section: {
            heading: chunkIdx === 0 ? sec.heading : `${sec.heading || 'Section'} (Continued)`,
            content: chunkBlocks.join('')
          },
          originalIndex: secIdx,
          isContinuation: chunkIdx > 0,
          chunkIdx: chunkIdx
        });
        currentHeight += chunkH;
        chunkIdx++;

        // If blocks still remain, push current page and flow to next page
        if (remainingBlocks.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          isPage1 = false;
        }
      }
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    return pages;
  };

  // Available vertical height inside page sheets for content
  // Realistic overhead on Page 1: padding (80px), header (46px), footer (35px) + chapter title/meta (140px) = ~301px
  const availPage1 = Math.max(350, dynamicMinHeightPx - 340); // ~783px for A4 (clean breathing room, never pushes into border)
  const availSubsequent = Math.max(450, dynamicMinHeightPx - 230); // ~893px for continuation pages

  // Paginate Table of Contents (TOC) into page sheets - up to 24 chapters on a single page
  const tocItems = editableBook?.tableOfContents || [];
  const tocPages = [];
  const TOC_MAX_SINGLE_PAGE = 24;

  if (tocItems.length === 0) {
    tocPages.push([]);
  } else if (tocItems.length <= TOC_MAX_SINGLE_PAGE) {
    // Fits cleanly on 1 page without leaving an awkward half-empty page
    tocPages.push(tocItems);
  } else {
    // If more than 24 chapters, balance items evenly across pages
    const pagesCount = Math.ceil(tocItems.length / 22);
    const perPage = Math.ceil(tocItems.length / pagesCount);
    for (let i = 0; i < tocItems.length; i += perPage) {
      tocPages.push(tocItems.slice(i, i + perPage));
    }
  }

  // Pre-calculate pagination and cumulative page numbers for every chapter
  let runningPageNum = 1;
  const chapterPagesMap = (editableBook?.chapters || []).map((ch, chIdx) => {
    const pages = paginateSections(ch.sections || [], availPage1, availSubsequent);
    const startPage = runningPageNum;
    runningPageNum += pages.length;
    return {
      chIdx,
      chapter: ch,
      pages,
      startPage,
      pageCount: pages.length
    };
  });

  const totalContentPages = runningPageNum - 1;
  const totalBookPages = 1 /* Cover */ + tocPages.length + totalContentPages;

  if (!editableBook) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <p className="text-gray-500">Loading book data...</p>
      </div>
    );
  }

  const chaptersList = editableBook?.chapters || [];
  const activeChapterIdx = Math.max(0, Math.min(chaptersList.length - 1, selectedChapterIdx));
  const activeCh = chaptersList[activeChapterIdx] || {
    chapterNumber: 1,
    title: 'Chapter 1: New Chapter',
    summary: '',
    sections: [{ heading: 'Introduction', content: '<p>Write your chapter content here...</p>' }]
  };

  return (
    <div className="studio-split-layout w-full">
      {/* ========================================================================= */}
      {/* 👈 LEFT SIDEBAR: ALL CONTROLS, TOOLS, STYLES, ACTIONS & CHAPTER NAVIGATOR */}
      {/* ========================================================================= */}
      <aside className="studio-left-panel space-y-4 no-scrollbar pr-1">
        
        {/* CARD 1: WORD EDIT MODE, TOOLS & ACTIONS */}
        <div className="bg-white border border-gray-200 rounded-none p-4 shadow-md space-y-3">
          {/* Header Toggle: Word Edit Mode: ON / OFF */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <FaPenToSquare className="text-xs text-indigo-600" /> Word Edit Mode:
            </span>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                isEditMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isEditMode ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              {isEditMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Quick Actions in Edit Mode: Sync Pages & Save */}
          {isEditMode && (
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleSyncPages}
                className="flex-1 py-1.5 px-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Balance text and distribute overflow onto new pages"
              >
                <FaBolt className="text-xs text-indigo-600" /> Sync Pages
              </button>
              <button
                type="button"
                onClick={handleSaveBook}
                disabled={isSaving}
                className="flex-1 py-1.5 px-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Save changes to database"
              >
                <FaFloppyDisk className="text-xs text-gray-600" /> {isSaving ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          )}

          {/* 👁️ Preview Real A4 PDF Button */}
          <button
            type="button"
            onClick={() => handlePreviewRealPDF(false)}
            disabled={isPreviewingPDF}
            className="w-full py-2.5 px-3 text-xs font-extrabold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 rounded-none shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Preview the exact A4 PDF that will be downloaded"
          >
            {isPreviewingPDF ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                Generating A4 PDF Preview...
              </>
            ) : (
              <>
                <FaEye className="text-sm text-rose-600" /> Preview Real A4 PDF
              </>
            )}
          </button>

          {/* 📥 Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-none shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FaFilePdf className="text-base" /> Download PDF
              </>
            )}
          </button>

          {saveStatus && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-none text-xs font-semibold text-emerald-700 text-center animate-fade-in">
              {saveStatus}
            </div>
          )}
        </div>

        {/* CARD 2: SELECTED STYLE (TEMPLATES) */}
        <div className="bg-white border border-gray-200 rounded-none p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
              Selected Style:
            </span>
            <span className="text-xs font-bold text-indigo-600 capitalize">
              {currentTemplate}
            </span>
          </div>

          <div className="space-y-1.5">
            {TEMPLATES.map(tpl => {
              const isSelected = currentTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateSelect(tpl.id)}
                  className={`w-full text-left p-2.5 rounded-none text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-300'
                      : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border border-gray-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg flex items-center justify-center w-6 h-6">{getTemplateIcon(tpl.id)}</span>
                    <div>
                      <span className="block font-semibold">{tpl.name}</span>
                      <span className={`text-[10px] block ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {tpl.desc}
                      </span>
                    </div>
                  </div>
                  {isSelected && <FaCheck className="text-white text-xs font-extrabold" />}
                </button>
              );
            })}

            {/* ──────────── 6th: Style from My Book ──────────── */}
            <div className={`w-full rounded-none text-xs border transition-all ${
              currentTemplate === 'custom-style'
                ? 'border-violet-500 ring-2 ring-violet-300 bg-violet-600'
                : 'border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100'
            }`}>
              {/* Header row — click to trigger file picker */}
              <button
                type="button"
                onClick={() => styleBookInputRef.current?.click()}
                disabled={isAnalyzingStyle}
                className={`w-full text-left p-2.5 flex items-center justify-between cursor-pointer ${
                  currentTemplate === 'custom-style' ? 'text-white' : 'text-violet-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg flex items-center justify-center w-6 h-6">{isAnalyzingStyle ? <FaSpinner className="animate-spin text-base" /> : <FaPaperclip className="text-base" />}</span>
                  <div>
                    <span className="block font-semibold">
                      {isAnalyzingStyle ? 'Analyzing Style…' : 'Style from My Book'}
                    </span>
                    <span className={`text-[10px] block ${
                      currentTemplate === 'custom-style' ? 'text-violet-200' : 'text-violet-400'
                    }`}>
                      {styleBookFileName
                        ? <span className="flex items-center gap-1"><FaBookOpen className="text-[10px]" /> {styleBookFileName}</span>
                        : 'Upload a reference PDF — AI clones its style'}
                    </span>
                  </div>
                </div>
                {currentTemplate === 'custom-style' && !isAnalyzingStyle && (
                  <FaCheck className="text-white text-xs font-extrabold" />
                )}
              </button>

              {/* Style Config badge — shown after analysis */}
              {customStyleConfig && currentTemplate === 'custom-style' && (
                <div className="px-2.5 pb-2 flex flex-wrap gap-1">
                  <span className="bg-violet-200 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize">
                    {customStyleConfig.writingTone}
                  </span>
                  <span className="bg-violet-200 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize">
                    {customStyleConfig.fontStyle}
                  </span>
                  {customStyleConfig.hasSummaryBox && (
                    <span className="bg-violet-200 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <FaListCheck className="text-[9px]" /> Summary Boxes
                    </span>
                  )}
                  {customStyleConfig.hasQuotes && (
                    <span className="bg-violet-200 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <FaQuoteLeft className="text-[9px]" /> Quotes
                    </span>
                  )}
                  {customStyleConfig.hasNumberedKeyPoints && (
                    <span className="bg-violet-200 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <FaListOl className="text-[9px]" /> Key Points
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => styleBookInputRef.current?.click()}
                    className="text-[9px] text-violet-300 underline ml-auto cursor-pointer"
                  >
                    Change
                  </button>
                </div>
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
            {/* ──────────────────────────────────────────────── */}

          </div>
        </div>

        {/* CARD 3: TOTAL CHAPTERS (CHAPTER QUICK NAVIGATOR) */}
        <div className="bg-white border border-gray-200 rounded-none p-4 shadow-md space-y-2.5 max-h-[350px] overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700">
              Chapters ({(editableBook.chapters || []).length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddChapter}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer hover:underline flex items-center gap-1"
                title="Add a new chapter"
              >
                <FaPlus className="text-[9px]" /> Add
              </button>
              <span className="text-gray-300">|</span>
              <span
                className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                onClick={handleUpdateIndexPage}
                title="Sync Table of Contents with current chapters"
              >
                <FaRotate className="text-[9px]" /> Sync Index
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {(editableBook.chapters || []).map((ch, idx) => {
              const isSelected = selectedChapterIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedChapterIdx(idx);
                    if (viewMode === 'preview') {
                      scrollToChapter(idx);
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'hover:bg-indigo-50/70 hover:text-indigo-700 text-gray-700 font-medium'
                  }`}
                >
                  <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ch.chapterNumber || idx + 1}
                  </span>
                  <span className="truncate flex-1">{ch.title || `Chapter ${idx + 1}`}</span>
                  {isSelected && <FaPenToSquare className="text-[11px]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start New Book Link */}
        <div className="text-center pt-1">
          <button
            onClick={onReset}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium hover:underline transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <FaArrowLeft className="text-[9px]" /> Start New Book
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 👉 RIGHT SIDE CANVAS: AUTHENTIC A4 PDF READER & BOOK FORMATTED CANVAS */}
      {/* ========================================================================= */}
      <main className="studio-right-panel min-w-0">
        {/* TOP FIXED CONTROLS GROUP (Ribbon + Viewer Bar - Never Scrolls Away) */}
        <div className="studio-top-controls-group">
          {/* 🌟 MS WORD FIXED TOP RIBBON BAR (Docked Permanently at Top) */}
          {isEditMode && (
            <div
              id="ms-word-ribbon-container"
              onMouseDown={(e) => e.preventDefault()}
              className="ms-word-ribbon-bar bg-white border border-gray-200 rounded-none p-1 shadow-md mb-2.5 transition-all relative"
              style={{ minHeight: '85px', zIndex: 50 }}
            >
              {!activeEditorField && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm font-medium z-0 pointer-events-none">
                  Click on any text below to start editing...
                </div>
              )}
            </div>
          )}

          {/* Top Controls Bar with Segmented View Switcher */}
          <div className="bg-white border border-gray-200 rounded-none p-2.5 shadow-md mb-2.5 flex items-center justify-between flex-wrap gap-3">
            {/* Left: View Mode Segmented Switcher & Contextual Tools */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Segmented Mode Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl shadow-inner gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'editor'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaPenToSquare className="text-xs" /> Chapter Word Editor
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaBookOpen className="text-xs" /> Book Page Preview
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewRealPDF(false)}
                  disabled={isPreviewingPDF}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-xs"
                  title="Generate & View Real A4 PDF Preview (Exact replica of what gets downloaded)"
                >
                  {isPreviewingPDF ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading PDF...</span>
                    </>
                  ) : (
                    <>
                      <FaEye className="text-xs" /> Real PDF Preview
                    </>
                  )}
                </button>
              </div>

              {/* In Editor Mode: Fast Chapter Switcher */}
              {viewMode === 'editor' && (
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1 text-xs">
                  <button
                    type="button"
                    disabled={activeChapterIdx <= 0}
                    onClick={() => setSelectedChapterIdx(prev => Math.max(0, prev - 1))}
                    className="px-2 py-1 rounded-md hover:bg-white text-gray-700 font-bold transition disabled:opacity-30 cursor-pointer flex items-center gap-1"
                    title="Previous Chapter"
                  >
                    <FaChevronLeft className="text-[10px]" /> Prev
                  </button>

                  <select
                    value={activeChapterIdx}
                    onChange={(e) => setSelectedChapterIdx(Number(e.target.value))}
                    className="font-bold text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[220px] truncate"
                  >
                    {chaptersList.map((ch, idx) => (
                      <option key={idx} value={idx}>
                        Ch {ch.chapterNumber || idx + 1}: {ch.title ? (ch.title.length > 25 ? ch.title.substring(0, 25) + '...' : ch.title) : `Chapter ${idx + 1}`}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={activeChapterIdx >= chaptersList.length - 1}
                    onClick={() => setSelectedChapterIdx(prev => Math.min(chaptersList.length - 1, prev + 1))}
                    className="px-2 py-1 rounded-md hover:bg-white text-gray-700 font-bold transition disabled:opacity-30 cursor-pointer flex items-center gap-1"
                    title="Next Chapter"
                  >
                    Next <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
              )}

              {/* Document-Wide Spacing / Gap Preset Selector */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 text-xs shadow-2xs">
                <span className="text-gray-500 font-bold flex items-center gap-1 select-none" title="Line & Paragraph Spacing">
                  <FaArrowsUpDown className="text-gray-500 text-xs" /> <span className="hidden sm:inline">Gap:</span>
                </span>
                <select
                  value={docSpacing}
                  onChange={(e) => setDocSpacing(e.target.value)}
                  className="font-bold text-xs bg-white border border-gray-200 rounded-md px-2 py-0.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Change Paragraph & Line Gap"
                >
                  <option value="compact">Compact (Tight Gap)</option>
                  <option value="normal">Normal (Standard Word)</option>
                  <option value="relaxed">Relaxed (1.5 Line Gap)</option>
                </select>
              </div>

              {/* In Preview Mode: Format Preset Dropdown & Dimensions */}
              {viewMode === 'preview' && (
                <>
                  <div className="relative">
                    <select
                      value={pageFormat}
                      onChange={(e) => handleSelectPreset(e.target.value)}
                      className="text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                      title="Choose Page Dimension Preset"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                      <option value="Letter">Letter (216 × 279 mm)</option>
                      <option value="Novel">6" × 9" US Trade (Amazon KDP)</option>
                      <option value="Digest">5.5" × 8.5" Digest Novel</option>
                      <option value="Custom">Custom Size</option>
                    </select>
                  </div>

                  {/* Width Stepper */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5 text-xs shadow-2xs">
                    <span className="px-1.5 text-[11px] font-bold text-gray-400 select-none">W</span>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = Number(pageWidthMm) || 210;
                        setPageWidthMm(Math.max(50, curr - 5));
                        setPageFormat('Custom');
                      }}
                      className="w-5 h-5 rounded-md hover:bg-white text-gray-600 font-bold transition flex items-center justify-center text-xs cursor-pointer"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>
                    <input
                      type="number"
                      value={pageWidthMm}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-12 text-center font-mono font-bold text-xs text-gray-800 bg-white border border-gray-200 rounded py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const curr = Number(pageWidthMm) || 210;
                        setPageWidthMm(Math.min(800, curr + 5));
                        setPageFormat('Custom');
                      }}
                      className="w-5 h-5 rounded-md hover:bg-white text-gray-600 font-bold transition flex items-center justify-center text-xs cursor-pointer"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                    <span className="px-1 text-[10px] text-gray-400 font-semibold select-none">mm</span>
                  </div>

                  <span className="text-gray-300 font-bold text-xs select-none">×</span>

                  {/* Height Stepper */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5 text-xs shadow-2xs">
                    <span className="px-1.5 text-[11px] font-bold text-gray-400 select-none">H</span>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = Number(pageHeightMm) || 297;
                        setPageHeightMm(Math.max(50, curr - 5));
                        setPageFormat('Custom');
                      }}
                      className="w-5 h-5 rounded-md hover:bg-white text-gray-600 font-bold transition flex items-center justify-center text-xs cursor-pointer"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>
                    <input
                      type="number"
                      value={pageHeightMm}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-12 text-center font-mono font-bold text-xs text-gray-800 bg-white border border-gray-200 rounded py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const curr = Number(pageHeightMm) || 297;
                        setPageHeightMm(Math.min(1200, curr + 5));
                        setPageFormat('Custom');
                      }}
                      className="w-5 h-5 rounded-md hover:bg-white text-gray-600 font-bold transition flex items-center justify-center text-xs cursor-pointer"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                    <span className="px-1 text-[10px] text-gray-400 font-semibold select-none">mm</span>
                  </div>

                  {/* Reset to Standard PDF Button */}
                  <button
                    type="button"
                    onClick={handleResetToStandardPDF}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                      isStandardA4
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100'
                        : 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                    }`}
                  >
                    <FaFileLines className="text-xs" />
                    <span>{isStandardA4 ? 'PDF A4' : 'Reset A4'}</span>
                  </button>

                  <span className="text-xs font-semibold text-gray-500 hidden xl:inline">
                    {totalBookPages} Total Pages
                  </span>
                </>
              )}
            </div>

            {/* Right: Actions (Save, AI Assistant, Zoom, Multi-format Download) */}
            <div className="flex items-center gap-2">
              {/* ✨ In-Editor AI Assistant Button */}
              <button
                type="button"
                onClick={() => handleOpenSectionAi(activeChapterIdx, 0)}
                className="px-3 py-1.5 text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ring-2 ring-purple-400/30"
              >
                <FaWandMagicSparkles className="text-xs" />
                <span>AI Assistant</span>
              </button>

              {/* Quick Save Button */}
              <button
                type="button"
                onClick={handleSaveBook}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FaFloppyDisk className="text-xs" /> {isSaving ? 'Saving...' : 'Save'}
              </button>

              {/* Zoom Controls (when in preview) */}
              {viewMode === 'preview' && (
                <div className="flex items-center bg-gray-100 rounded-xl p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
                    className="w-7 h-7 rounded-lg hover:bg-white text-gray-700 font-bold transition flex items-center justify-center text-sm cursor-pointer shadow-2xs"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="px-2 font-mono font-bold text-gray-700 min-w-[44px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                    className="w-7 h-7 rounded-lg hover:bg-white text-gray-700 font-bold transition flex items-center justify-center text-sm cursor-pointer shadow-2xs"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
              )}

              {/* Preview Real PDF Button */}
              <button
                type="button"
                onClick={() => handlePreviewRealPDF(false)}
                disabled={isPreviewingPDF}
                className="px-3 py-1.5 text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Preview real A4 PDF before downloading"
              >
                {isPreviewingPDF ? (
                  <>
                    <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <>
                    <FaEye className="text-xs text-rose-600" />
                    <span>Real PDF Preview</span>
                  </>
                )}
              </button>

              {/* Multi-Format Export Button Group */}
              <div className="relative">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="px-3.5 py-1.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-l-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDownloading ? 'Generating...' : <><FaFilePdf className="text-xs" /> Download PDF</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(prev => !prev)}
                    className="px-2 py-1.5 text-xs font-extrabold bg-indigo-700 hover:bg-indigo-800 text-white rounded-r-xl border-l border-indigo-500 transition-all shadow-xs cursor-pointer flex items-center justify-center"
                    title="More Export Formats"
                  >
                    <FaChevronDown className="text-[9px]" />
                  </button>
                </div>

                {/* Dropdown Options */}
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 py-1.5 text-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handlePreviewRealPDF(false)}
                      disabled={isPreviewingPDF}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-gray-800 font-semibold cursor-pointer border-b border-gray-100"
                    >
                      <FaEye className="text-base text-rose-600" />
                      <div>
                        <p className="font-bold text-rose-600">Preview Real A4 PDF</p>
                        <p className="text-[10px] text-gray-400 font-normal">Exact look before downloading</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreviewRealPDF(true)}
                      disabled={isPreviewingPDF}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-gray-800 font-semibold cursor-pointer border-b border-gray-100"
                    >
                      <FaArrowUpRightFromSquare className="text-base text-indigo-600" />
                      <div>
                        <p className="font-bold">Open PDF in New Tab</p>
                        <p className="text-[10px] text-gray-400 font-normal">Browser native PDF reader</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-gray-800 font-semibold cursor-pointer"
                    >
                      <FaFilePdf className="text-base text-red-500" />
                      <div>
                        <p className="font-bold">PDF Document</p>
                        <p className="text-[10px] text-gray-400 font-normal">Print & Amazon KDP Ready</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadWord}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-gray-800 font-semibold border-t border-gray-100 cursor-pointer"
                    >
                      <FaFileWord className="text-base text-blue-600" />
                      <div>
                        <p className="font-bold">Word (.doc)</p>
                        <p className="text-[10px] text-gray-400 font-normal">Editable Microsoft Word</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadMarkdown}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-gray-800 font-semibold border-t border-gray-100 cursor-pointer"
                    >
                      <FaFileCode className="text-base text-emerald-600" />
                      <div>
                        <p className="font-bold">Markdown (.md)</p>
                        <p className="text-[10px] text-gray-400 font-normal">Clean Plain Text & Headings</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: ✏️ CHAPTER WORD EDITOR (CONTINUOUS MS WORD PAPER) */}
        {/* ========================================================= */}
        {viewMode === 'editor' && (
          <div className="word-document-canvas transition-all">
            {/* Friendly tip banner */}
            <div className="w-full max-w-[840px] mb-3 mx-auto bg-indigo-50/90 border border-indigo-200/80 rounded-xl px-4 py-2.5 text-xs text-indigo-900 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FaPenToSquare className="text-base text-indigo-600 shrink-0" />
                <span>
                  <strong>Full Word Freedom:</strong> Aap yahan bina kisi page limit ya cut-off ke jitna marzi Enter daba kar likh sakte hain. Poora text safe rahega!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <FaBookOpen className="text-xs" /> View as Pages
              </button>
            </div>

            {/* Inject custom style from uploaded reference book */}
            {currentTemplate === 'custom-style' && customStyleCSS && (
              <style dangerouslySetInnerHTML={{ __html: customStyleCSS }} />
            )}

            <div className={`word-paper-sheet template-${currentTemplate} spacing-${docSpacing}`}>
              {/* Chapter Top Meta & Controls */}
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-200">
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                  Chapter {activeCh.chapterNumber || activeChapterIdx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSection(activeChapterIdx)}
                    className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FaPlus className="text-[10px]" /> Add Section
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChapter(activeChapterIdx)}
                    title="Delete this chapter"
                    className="text-xs px-2.5 py-1.5 text-red-500 hover:bg-red-50 font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FaTrashCan className="text-xs" /> Delete Chapter
                  </button>
                </div>
              </div>

              {/* Editable Chapter Title */}
              <h1
                data-field-type="ch-title"
                data-ch-idx={activeChapterIdx}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleChapterTitleBlur(activeChapterIdx, e)}
                className="chapter-heading-title tinymce-editable text-3xl font-extrabold mb-4 text-gray-900"
                dangerouslySetInnerHTML={{ __html: activeCh.title || `Chapter ${activeChapterIdx + 1}` }}
              />

              {/* Editable Chapter Summary */}
              <div
                data-field-type="ch-summary"
                data-ch-idx={activeChapterIdx}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleChapterSummaryBlur(activeChapterIdx, e)}
                className="chapter-summary-box tinymce-editable text-sm italic text-gray-600 bg-indigo-50/40 p-3.5 rounded-lg border border-indigo-100/80 mb-5"
                dangerouslySetInnerHTML={{ __html: activeCh.summary || 'Summary: Add 1-2 sentence overview for this chapter...' }}
              />

              {/* Continuous Sections inside Chapter */}
              <div className="chapter-sections-list">
                {(activeCh.sections || []).map((sec, secIdx) => {
                  const secGap = getSectionGap(sec);
                  return (
                    <div
                      key={secIdx}
                      className="section-block group relative"
                      style={{ marginBottom: `${secGap}px` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          data-field-type="sec-heading"
                          data-ch-idx={activeChapterIdx}
                          data-sec-idx={secIdx}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleSectionHeadingBlur(activeChapterIdx, secIdx, e)}
                          className="section-heading-text tinymce-editable text-base font-bold text-gray-900"
                          dangerouslySetInnerHTML={{ __html: sec.heading || `Section ${secIdx + 1}` }}
                        />

                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* Section Gap Stepper */}
                          <div className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-0.5 text-xs text-gray-700 shadow-2xs" title="Adjust gap below this section">
                            <span className="text-[10px] text-gray-400 font-bold uppercase select-none mr-0.5">Gap</span>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateSectionSpacing(activeChapterIdx, secIdx, Math.max(0, secGap - 4));
                              }}
                              className="w-5 h-5 rounded hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer transition active:scale-95"
                              title="Reduce section gap (-4px)"
                            >
                              <FaMinus className="text-[9px]" />
                            </button>
                            <span className="font-mono font-bold text-gray-800 text-[11px] min-w-[28px] text-center select-none">
                              {secGap}px
                            </span>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateSectionSpacing(activeChapterIdx, secIdx, Math.min(80, secGap + 4));
                              }}
                              className="w-5 h-5 rounded hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer transition active:scale-95"
                              title="Increase section gap (+4px)"
                            >
                              <FaPlus className="text-[9px]" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenSectionAi(activeChapterIdx, secIdx)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 border border-purple-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Ask AI to expand, polish, or edit this section"
                          >
                            <FaWandMagicSparkles className="text-xs" />
                            <span>Ask AI</span>
                          </button>

                          {(activeCh.sections || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(activeChapterIdx, secIdx)}
                              className="text-xs text-red-500 hover:text-red-700 p-1 cursor-pointer flex items-center justify-center"
                              title="Remove this Section"
                            >
                              <FaXmark className="text-xs" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        data-field-type="sec-content"
                        data-ch-idx={activeChapterIdx}
                        data-sec-idx={secIdx}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleSectionContentBlur(activeChapterIdx, secIdx, e)}
                        className="section-body-content tinymce-editable text-sm text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sec.content || '<p>Click here to write section paragraphs...</p>' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom: Add Section & Add Next Chapter Buttons */}
              <div className="mt-8 pt-4 border-t border-dashed border-gray-200 text-center flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAddSection(activeChapterIdx)}
                  className="px-5 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FaPlus className="text-xs" /> Add Section to Chapter {activeCh.chapterNumber || activeChapterIdx + 1}
                </button>

                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FaFileLines className="text-xs" /> Add Next Chapter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: 📖 BOOK PAGE PREVIEW (TYPESET A4/A5 PHYSICAL PAGES) */}
        {/* ========================================================= */}
        {viewMode === 'preview' && (
          <div
            ref={bookContainerRef}
            className="pdf-viewport-canvas transition-all"
          >

          {/* Zoom Wrapper */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '36px'
            }}
            className="transition-transform duration-200"
          >
            {/* PAGE 1: BOOK FRONT COVER PAGE (A4 SHEET) */}
            <div
              className={`book-page pdf-page-sheet a4-page-cover template-${currentTemplate}`}
              style={{
                maxWidth: `${dynamicWidthPx}px`,
                minHeight: `${dynamicMinHeightPx}px`,
                aspectRatio: dynamicAspectRatio
              }}
            >
              {editableBook.coverImage ? (
                <div
                  onClick={() => openImageInNewTab(editableBook.coverImage, editableBook.title, editableBook.author)}
                  title="Click to view full cover in new tab"
                  className="w-full h-full relative overflow-hidden flex items-center justify-center bg-white group cursor-pointer"
                >
                  <img
                    src={editableBook.coverImage}
                    alt="Book Front Cover"
                    className="w-full h-full object-cover object-center block group-hover:scale-101 transition-transform"
                  />
                  {/* Subtle hover badge indicating click to open in new tab */}
                  <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-lg pointer-events-none">
                    <FaMagnifyingGlass className="text-xs" /> Click to view in new tab ↗
                  </div>
                  {isEditMode && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <span className="flex items-center gap-1.5"><FaImage className="text-indigo-600 text-xs" /> Custom Cover Active</span>
                      <button
                        type="button"
                        onClick={() => setEditableBook(prev => ({ ...prev, coverImage: null }))}
                        className="text-red-500 hover:text-red-700 font-bold ml-1 hover:underline cursor-pointer"
                      >
                        Use Template Cover
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cover-inner flex flex-col items-center justify-center h-full p-12 text-center">
                  <div
                    data-field-type="category"
                    contentEditable={isEditMode}
                    suppressContentEditableWarning={true}
                    onBlur={handleCategoryBlur}
                    className={`cover-category tinymce-editable ${isEditMode ? 'editable-focus' : ''}`}
                    dangerouslySetInnerHTML={{ __html: `${editableBook.category || 'Technology'} • ${editableBook.language || 'English'}` }}
                  />

                  <h1
                    data-field-type="title"
                    contentEditable={isEditMode}
                    suppressContentEditableWarning={true}
                    onBlur={handleTitleBlur}
                    className={`cover-title tinymce-editable ${isEditMode ? 'editable-focus' : ''}`}
                    dangerouslySetInnerHTML={{ __html: editableBook.title || 'Untitled Book' }}
                  />

                  <div className="cover-divider" />

                  <div
                    data-field-type="author"
                    contentEditable={isEditMode}
                    suppressContentEditableWarning={true}
                    onBlur={handleAuthorBlur}
                    className={`cover-author tinymce-editable ${isEditMode ? 'editable-focus' : ''}`}
                    dangerouslySetInnerHTML={{ __html: `By ${editableBook.author || 'Author Name'}` }}
                  />
                </div>
              )}
            </div>

            {/* PAGES 2+: INDEX PAGES / TABLE OF CONTENTS (A4 SHEETS) */}
            {tocPages.map((pageItems, tocPageIdx) => {
              const isFirstTOCPage = tocPageIdx === 0;
              const pageNumberRoman = toRoman(tocPageIdx + 1);

              return (
                <div
                  key={`toc-page-${tocPageIdx}`}
                  className={`book-page pdf-page-sheet a4-page-content template-${currentTemplate}`}
                  style={{
                    maxWidth: `${dynamicWidthPx}px`,
                    minHeight: `${dynamicMinHeightPx}px`,
                    height: `${dynamicMinHeightPx}px`,
                    maxHeight: `${dynamicMinHeightPx}px`
                  }}
                >
                  <div className="flex-1 flex flex-col">
                    {/* Running Header */}
                    <div className="running-header">
                      <span className="truncate max-w-[280px]">{editableBook.title || 'Book Title'}</span>
                      <span>Table of Contents{tocPages.length > 1 ? ` (Part ${tocPageIdx + 1})` : ''}</span>
                    </div>

                    {/* Header Row */}
                    {isFirstTOCPage ? (
                      <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-indigo-600">
                        <div>
                          <h2 className="toc-main-title text-2xl font-extrabold tracking-tight text-gray-900">
                            TABLE OF CONTENTS
                          </h2>
                          <p className="text-xs text-gray-400 mt-0.5">Book Structure & Chapters Index</p>
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={handleUpdateIndexPage}
                            className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FaRotate className="text-xs" /> Sync Index
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="pb-2 mb-4 border-b border-gray-200">
                        <h2 className="toc-main-title text-lg font-extrabold tracking-tight text-gray-800">
                          TABLE OF CONTENTS <span className="text-xs font-normal text-gray-400">(Continued)</span>
                        </h2>
                      </div>
                    )}

                    {/* Dot Leader Book TOC Rows */}
                    <div className="space-y-2.5 pt-1 flex-1">
                      {pageItems.map((item, itemIdx) => {
                        const globalTOCIdx = tocItems.indexOf(item) !== -1
                          ? tocItems.indexOf(item)
                          : (item.chapter ? item.chapter - 1 : itemIdx);
                        const chapterTargetIdx = item.chapter ? item.chapter - 1 : globalTOCIdx;
                        const targetStartPage = chapterPagesMap[chapterTargetIdx]?.startPage || (chapterTargetIdx + 1);

                        return (
                          <div key={globalTOCIdx} className="flex items-baseline justify-between gap-2 group py-0.5">
                            <div className="flex items-baseline gap-2 flex-1">
                              <span className="font-bold text-xs text-indigo-600 font-mono w-6">
                                {String(item.chapter || globalTOCIdx + 1).padStart(2, '0')}.
                              </span>
                              <span
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleTOCItemBlur(globalTOCIdx, e)}
                                className={`font-semibold text-sm text-gray-800 hover:text-indigo-600 cursor-pointer ${
                                  isEditMode ? 'editable-focus' : ''
                                }`}
                                onClick={() => scrollToChapter(chapterTargetIdx)}
                              >
                                {item.title || `Chapter ${globalTOCIdx + 1}`}
                              </span>
                              <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1" />
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-500">
                              Page {targetStartPage}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {isFirstTOCPage && isEditMode && pageItems.length <= 18 && (
                      <div className="mt-3 p-2 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FaLightbulb className="text-amber-500 text-xs shrink-0" /> <strong>Book Formatting Tip:</strong> Chapters edit karne ke baad <strong>"Sync Index"</strong> dabayein, Table of Contents auto-refresh ho jayega!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Running Footer */}
                  <div className="running-footer">
                    <span>{editableBook.author ? `By ${editableBook.author}` : 'AI Book Publisher'}</span>
                    <span className="font-mono font-semibold">Page {pageNumberRoman} • Front Matter</span>
                  </div>
                </div>
              );
            })}

            {/* PAGES 3+: ALL CHAPTERS & SECTIONS (A4 SHEETS PAGINATED) */}
            {chapterPagesMap.map((chData) => {
              const { chIdx, chapter: ch, pages, startPage } = chData;

              return pages.map((pageSections, pageIdx) => {
                const isFirstPageOfChapter = pageIdx === 0;
                const isLastPageOfChapter = pageIdx === pages.length - 1;
                const currentSheetPageNumber = startPage + pageIdx;

                return (
                  <div
                    key={`ch-${chIdx}-p-${pageIdx}`}
                    id={isFirstPageOfChapter ? `chapter-card-${chIdx}` : undefined}
                    className={`book-page pdf-page-sheet a4-page-content template-${currentTemplate} spacing-${docSpacing}`}
                    style={{
                      maxWidth: `${dynamicWidthPx}px`,
                      minHeight: `${dynamicMinHeightPx}px`,
                      height: `${dynamicMinHeightPx}px`,
                      maxHeight: `${dynamicMinHeightPx}px`
                    }}
                  >
                    <div className="flex-1 flex flex-col">
                      {/* Running Header */}
                      <div className="running-header">
                        <span className="truncate max-w-[280px]">{editableBook.title || 'Book Title'}</span>
                        <span className="truncate max-w-[280px] font-semibold text-gray-700">
                          Chapter {ch.chapterNumber || chIdx + 1}
                          {!isFirstPageOfChapter ? ' (Continued)' : ''}
                        </span>
                      </div>

                      {/* If First Page of Chapter: Show Chapter Header, Title & Summary */}
                      {isFirstPageOfChapter ? (
                        <>
                          {/* Chapter Meta & Controls */}
                          <div className="chapter-meta-top flex items-center justify-between mb-3">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                              Chapter {ch.chapterNumber || chIdx + 1}
                            </span>
                            {isEditMode && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddSection(chIdx)}
                                  className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <FaPlus className="text-[10px]" /> Add Section
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChapter(chIdx)}
                                  title="Delete Chapter"
                                  className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <FaTrashCan className="text-xs" /> Delete Chapter
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Editable Chapter Title */}
                          <h2
                            data-field-type="ch-title"
                            data-ch-idx={chIdx}
                            contentEditable={isEditMode}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleChapterTitleBlur(chIdx, e)}
                            className={`chapter-heading-title tinymce-editable ${isEditMode ? 'editable-focus' : ''}`}
                            dangerouslySetInnerHTML={{ __html: ch.title || `Chapter ${chIdx + 1}` }}
                          />

                          {/* Editable Chapter Summary */}
                          <div
                            data-field-type="ch-summary"
                            data-ch-idx={chIdx}
                            contentEditable={isEditMode}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleChapterSummaryBlur(chIdx, e)}
                            className={`chapter-summary-box tinymce-editable ${isEditMode ? 'editable-focus' : ''} mb-4`}
                            dangerouslySetInnerHTML={{ __html: ch.summary || 'Summary: Add 1-2 sentence overview for this chapter...' }}
                          />
                        </>
                      ) : (
                        /* Subsequent Page of Chapter: Continuation indicator */
                        <div className="pb-2 mb-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Chapter {ch.chapterNumber || chIdx + 1}: {ch.title || `Chapter ${chIdx + 1}`}
                          </span>
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            Part {pageIdx + 1} of {pages.length}
                          </span>
                        </div>
                      )}

                      {/* Chapter Sections for this specific Page Sheet */}
                      <div className="chapter-sections-container flex-1">
                        {pageSections.map(({ section: sec, originalIndex: secIdx, isContinuation, chunkIdx }) => {
                          const originalSec = editableBook.chapters?.[chIdx]?.sections?.[secIdx] || sec;
                          const secGap = getSectionGap(originalSec);

                          return (
                            <div
                              key={`${secIdx}-${chunkIdx || 0}`}
                              className="section-block group relative"
                              style={{ marginBottom: `${secGap}px` }}
                            >
                              {/* Section Heading */}
                              <div className="flex items-center justify-between">
                                <h3
                                  data-field-type="sec-heading"
                                  data-ch-idx={chIdx}
                                  data-sec-idx={secIdx}
                                  contentEditable={isEditMode && !isContinuation}
                                  suppressContentEditableWarning={true}
                                  onBlur={(e) => handleSectionHeadingBlur(chIdx, secIdx, e)}
                                  className={`section-heading-text tinymce-editable ${isEditMode && !isContinuation ? 'editable-focus' : ''} ${isContinuation ? 'text-gray-500 font-semibold italic text-sm' : ''}`}
                                  dangerouslySetInnerHTML={{ __html: sec.heading || `Section ${secIdx + 1}` }}
                                />

                                {isEditMode && !isContinuation && (
                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    {/* Section Gap Stepper */}
                                    <div className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-2 py-0.5 text-xs text-gray-700 shadow-2xs" title="Adjust gap below this section">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase select-none mr-0.5">Gap</span>
                                      <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateSectionSpacing(chIdx, secIdx, Math.max(0, secGap - 4));
                                        }}
                                        className="w-5 h-5 rounded hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer transition active:scale-95"
                                        title="Reduce section gap (-4px)"
                                      >
                                        <FaMinus className="text-[9px]" />
                                      </button>
                                      <span className="font-mono font-bold text-gray-800 text-[11px] min-w-[28px] text-center select-none">
                                        {secGap}px
                                      </span>
                                      <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateSectionSpacing(chIdx, secIdx, Math.min(80, secGap + 4));
                                        }}
                                        className="w-5 h-5 rounded hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center cursor-pointer transition active:scale-95"
                                        title="Increase section gap (+4px)"
                                      >
                                        <FaPlus className="text-[9px]" />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenSectionAi(chIdx, secIdx)}
                                      className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                      title="Ask AI to edit this section"
                                    >
                                      <FaWandMagicSparkles className="text-xs" />
                                      <span>Ask AI</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSection(chIdx, secIdx)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500 hover:text-red-700 p-1 cursor-pointer flex items-center justify-center"
                                      title="Remove Section"
                                    >
                                      <FaXmark className="text-xs" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Section Content Paragraphs */}
                              <div
                                data-field-type="sec-content"
                                data-ch-idx={chIdx}
                                data-sec-idx={secIdx}
                                data-chunk-idx={chunkIdx || 0}
                                contentEditable={isEditMode}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleSectionContentBlur(chIdx, secIdx, e)}
                                className={`section-body-content tinymce-editable ${isEditMode ? 'editable-focus' : ''}`}
                                dangerouslySetInnerHTML={{ __html: sec.content || '<p>Click here to write section paragraphs...</p>' }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Section at bottom of Chapter (only on the last page of this chapter) */}
                      {isEditMode && isLastPageOfChapter && (
                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-center">
                          <button
                            type="button"
                            onClick={() => handleAddSection(chIdx)}
                            className="px-4 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <FaPlus className="text-xs" /> Add Section to Chapter {ch.chapterNumber || chIdx + 1}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Running Footer */}
                    <div className="running-footer">
                      <span>{editableBook.category || 'General'}</span>
                      <span className="font-mono font-semibold">Page {currentSheetPageNumber}</span>
                    </div>
                  </div>
                );
              });
            })}

            {/* Bottom: Add Chapter Box */}
            {isEditMode && (
              <div
                style={{ maxWidth: `${dynamicWidthPx}px` }}
                className="w-full p-8 text-center bg-white/80 backdrop-blur-sm border-2 border-dashed border-indigo-300 rounded-2xl shadow-sm"
              >
                <h4 className="text-sm font-bold text-gray-800 mb-1">Want to add another chapter?</h4>
                <p className="text-xs text-gray-500 mb-4">You can add unlimited chapters and edit them directly.</p>
                <button
                  onClick={handleAddChapter}
                  className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <FaPlus className="text-xs" /> Add Chapter {(editableBook.chapters || []).length + 1}
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* ================= CUSTOM CSS FOR REAL A4 BOOK PAGES & TEMPLATES ================= */}
      <style>{`
        /* Word Document Canvas (Continuous Writing View) */
        .word-document-canvas {
          flex: 1 1 0% !important;
          min-height: 0 !important;
          height: 100% !important;
          background: #e2e8f0;
          background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
          background-size: 20px 20px;
          padding: 24px 16px 80px;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          scroll-behavior: smooth !important;
          display: block !important;
        }

        .word-document-canvas::-webkit-scrollbar {
          display: block !important;
          width: 8px !important;
        }
        .word-document-canvas::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05) !important;
          border-radius: 8px !important;
        }
        .word-document-canvas::-webkit-scrollbar-thumb {
          background: #94a3b8 !important;
          border-radius: 8px !important;
        }
        .word-document-canvas {
          scrollbar-width: thin !important;
          scrollbar-color: #94a3b8 rgba(0, 0, 0, 0.05) !important;
        }

        .word-paper-sheet {
          background: #ffffff;
          width: 100%;
          max-width: 840px;
          margin: 0 auto;
          position: relative;
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          box-sizing: border-box;
          padding: 55px 70px 80px 70px;
          min-height: calc(100vh - 240px);
          height: auto !important;
          display: block !important;
          overflow: visible !important;
        }

        .word-paper-sheet .section-body-content {
          min-height: 0 !important;
          height: auto !important;
        }
        .word-paper-sheet .section-body-content p {
          margin: 0 0 6px 0 !important;
        }
        .word-paper-sheet .section-body-content p:last-child {
          margin-bottom: 0 !important;
        }
        .word-paper-sheet .tinymce-editable:focus,
        .word-paper-sheet [contenteditable]:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3) !important;
          border-radius: 4px;
        }

        /* ================= SPACING / GAP CONTROLLER PRESETS ================= */
        /* 1. Compact Spacing (Tight Minimal Gap) */
        .spacing-compact .section-block {
          margin-bottom: 8px;
        }
        .spacing-compact .section-body-content {
          line-height: 1.4 !important;
        }
        .spacing-compact .section-body-content p {
          margin: 0 0 2px 0 !important;
        }
        .spacing-compact .chapter-summary-box {
          margin-bottom: 12px !important;
          padding: 8px 12px !important;
        }

        /* 2. Normal Spacing (Standard Word 1.15) */
        .spacing-normal .section-block {
          margin-bottom: 18px;
        }
        .spacing-normal .section-body-content {
          line-height: 1.65 !important;
        }
        .spacing-normal .section-body-content p {
          margin: 0 0 6px 0 !important;
        }
        .spacing-normal .chapter-summary-box {
          margin-bottom: 20px !important;
          padding: 12px 16px !important;
        }

        /* 3. Relaxed Spacing (Word 1.5 Lines - Roomy) */
        .spacing-relaxed .section-block {
          margin-bottom: 28px;
        }
        .spacing-relaxed .section-body-content {
          line-height: 1.85 !important;
        }
        .spacing-relaxed .section-body-content p {
          margin: 0 0 12px 0 !important;
        }
        .spacing-relaxed .chapter-summary-box {
          margin-bottom: 28px !important;
          padding: 14px 18px !important;
        }

        /* Pure Studio 2-Column Split Layout (Desktop Workspace) */
        .studio-split-layout {
          display: flex !important;
          flex-direction: row !important;
          align-items: stretch !important;
          gap: 20px !important;
          width: 100% !important;
          height: calc(100vh - 85px) !important;
          max-height: calc(100vh - 85px) !important;
          overflow: hidden !important;
        }

        .studio-left-panel {
          width: 350px !important;
          min-width: 350px !important;
          max-width: 350px !important;
          flex-shrink: 0 !important;
          height: 100% !important;
          max-height: 100% !important;
          overflow-y: auto !important;
          padding-bottom: 24px !important;
        }

        .studio-right-panel {
          flex: 1 1 0% !important;
          min-width: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
        }

        .studio-top-controls-group {
          flex-shrink: 0 !important;
          width: 100% !important;
          z-index: 20 !important;
        }

        @media (max-width: 900px) {
          .studio-split-layout {
            flex-direction: column !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .studio-left-panel {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
          }
          .studio-right-panel {
            height: auto !important;
            max-height: none !important;
          }
        }

        /* Hide outer window scrollbars */
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        /* PDF Viewer Canvas: INDEPENDENT INTERNAL SCROLL */
        .pdf-viewport-canvas {
          flex: 1 1 0% !important;
          min-height: 0 !important;
          height: 100% !important;
          background: #e2e8f0;
          background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
          background-size: 20px 20px;
          padding: 28px 16px 40px;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06);
          overflow-y: auto !important;
          overflow-x: hidden !important;
          scroll-behavior: smooth !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Sleek custom visible scrollbar for the book canvas */
        .pdf-viewport-canvas::-webkit-scrollbar {
          display: block !important;
          width: 8px !important;
        }
        .pdf-viewport-canvas::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05) !important;
          border-radius: 8px !important;
        }
        .pdf-viewport-canvas::-webkit-scrollbar-thumb {
          background: #94a3b8 !important;
          border-radius: 8px !important;
        }
        .pdf-viewport-canvas::-webkit-scrollbar-thumb:hover {
          background: #64748b !important;
        }
        .pdf-viewport-canvas {
          scrollbar-width: thin !important;
          scrollbar-color: #94a3b8 rgba(0, 0, 0, 0.05) !important;
        }

        .pdf-page-sheet {
          background: #ffffff;
          width: 100%;
          max-width: 794px; /* Standard A4 width at 96 DPI */
          min-height: 1123px; /* Standard A4 height at 96 DPI */
          margin: 0 auto;
          position: relative;
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
          border-radius: 3px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden;
        }

        .pdf-page-sheet.a4-page-cover {
          aspect-ratio: 1 / 1.414;
          min-height: 1123px;
          padding: 0;
          overflow: hidden;
        }

        .pdf-page-sheet.a4-page-content {
          padding: 45px 55px 35px 55px;
          justify-content: flex-start !important;
          overflow: hidden;
        }

        .running-header {
          flex-shrink: 0 !important;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 24px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #9ca3af;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }

        .chapter-meta-top,
        .chapter-heading-title,
        .chapter-summary-box {
          flex-shrink: 0 !important;
        }

        .running-footer {
          flex-shrink: 0 !important;
          margin-top: auto !important;
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
        }

        /* Editable Focus Highlights */
        .editable-focus {
          outline: none;
          transition: all 0.2s ease;
          border-radius: 4px;
        }
        .editable-focus:hover {
          background-color: rgba(99, 102, 241, 0.04);
        }
        .editable-focus:focus {
          background-color: rgba(99, 102, 241, 0.08);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
          padding: 2px 6px;
        }

        /* Modern Template */
        .template-modern.cover-page {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: white;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 550px;
        }
        .template-modern .cover-category {
          font-size: 13px;
          letter-spacing: 3px;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        .template-modern .cover-title {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 20px;
          color: white;
        }
        .template-modern .cover-divider {
          width: 50px;
          height: 3px;
          background: #e94560;
          margin: 20px auto;
        }
        .template-modern .cover-author {
          font-size: 20px;
          font-weight: 300;
          opacity: 0.9;
        }
        .template-modern .toc-main-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f3460;
        }
        .template-modern .chapter-heading-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f3460;
          border-left: 5px solid #e94560;
          padding-left: 16px;
          margin-bottom: 12px;
        }
        .template-modern .chapter-summary-box {
          background: #f8f9ff;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: #555;
          margin-bottom: 24px;
        }
        .template-modern .section-heading-text {
          font-size: 20px;
          font-weight: 700;
          color: #16213e;
          margin-bottom: 8px;
        }
        .template-modern .section-body-content {
          font-size: 15px;
          line-height: 1.7;
          color: #374151;
          white-space: normal;
        }

        /* Classic Template */
        .template-classic.book-page {
          background: #fffef9;
          font-family: 'Georgia', serif;
          border: 1px solid #e7dfd5;
        }
        .template-classic.cover-page {
          border: 12px solid #8b4513;
          text-align: center;
          padding: 60px 40px;
        }
        .template-classic .cover-title {
          font-size: 38px;
          color: #4a2c0a;
          font-style: italic;
          font-weight: bold;
          margin: 20px 0;
        }
        .template-classic .cover-author {
          font-size: 18px;
          color: #6b4226;
          font-style: italic;
        }
        .template-classic .cover-divider {
          height: 1px;
          background: #8b4513;
          width: 80px;
          margin: 15px auto;
        }
        .template-classic .toc-main-title {
          font-size: 26px;
          color: #4a2c0a;
          font-style: italic;
        }
        .template-classic .chapter-heading-title {
          font-size: 28px;
          color: #4a2c0a;
          text-align: center;
          font-style: italic;
          margin-bottom: 15px;
        }
        .template-classic .chapter-summary-box {
          text-align: center;
          font-style: italic;
          color: #777;
          margin-bottom: 24px;
          font-size: 14px;
        }
        .template-classic .section-heading-text {
          font-size: 19px;
          color: #6b4226;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .template-classic .section-body-content {
          font-size: 15px;
          line-height: 1.8;
          color: #2c2c2c;
          text-align: justify;
          white-space: normal;
        }

        /* Education Template */
        .template-education.cover-page {
          background: linear-gradient(160deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .template-education .cover-title {
          font-size: 40px;
          font-weight: 800;
          color: white;
          margin: 15px 0;
        }
        .template-education .cover-category {
          background: rgba(255, 255, 255, 0.2);
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .template-education .cover-author {
          font-size: 18px;
          opacity: 0.9;
        }
        .template-education .chapter-heading-title {
          font-size: 26px;
          color: #667eea;
          background: #f7f8ff;
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 12px;
          font-weight: 800;
        }
        .template-education .chapter-summary-box {
          background: #fffbf0;
          border-left: 4px solid #f6ad55;
          padding: 12px 16px;
          font-size: 14px;
          color: #718096;
          margin-bottom: 24px;
          border-radius: 0 8px 8px 0;
        }
        .template-education .section-heading-text {
          font-size: 19px;
          color: #553c9a;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .template-education .section-body-content {
          font-size: 15px;
          line-height: 1.7;
          color: #4a5568;
          white-space: normal;
        }

        /* Minimal Template */
        .template-minimal.cover-page {
          border-bottom: 3px solid #111;
          padding: 80px 40px;
        }
        .template-minimal .cover-title {
          font-size: 46px;
          font-weight: 900;
          color: #111;
          line-height: 1.1;
          margin: 20px 0;
        }
        .template-minimal .cover-category {
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #888;
        }
        .template-minimal .cover-author {
          font-size: 16px;
          color: #666;
        }
        .template-minimal .chapter-heading-title {
          font-size: 30px;
          font-weight: 900;
          color: #111;
          margin-bottom: 10px;
        }
        .template-minimal .chapter-summary-box {
          font-size: 14px;
          color: #888;
          margin-bottom: 24px;
        }
        .template-minimal .section-heading-text {
          font-size: 18px;
          font-weight: 800;
          color: #222;
          margin-bottom: 8px;
        }
        .template-minimal .section-body-content {
          font-size: 15px;
          line-height: 1.7;
          color: #444;
          white-space: normal;
        }

        /* Technical Template */
        .template-technical.book-page {
          background: #1e1e1e;
          color: #d4d4d4;
          font-family: 'Courier New', monospace;
          border: 1px solid #333;
        }
        .template-technical.cover-page {
          border-left: 6px solid #569cd6;
          background: #1e1e1e;
          padding: 60px 40px;
        }
        .template-technical .cover-category {
          color: #6a9955;
          font-size: 13px;
        }
        .template-technical .cover-title {
          color: #569cd6;
          font-size: 38px;
          font-weight: bold;
          margin: 15px 0;
        }
        .template-technical .cover-author {
          color: #9cdcfe;
          font-size: 16px;
        }
        .template-technical .toc-main-title {
          color: #569cd6;
          font-size: 22px;
        }
        .template-technical .toc-item-row {
          color: #9cdcfe;
          border-bottom: 1px solid #2d2d2d;
        }
        .template-technical .toc-chap-badge {
          background: #2d2d2d;
          color: #569cd6;
        }
        .template-technical .chapter-heading-title {
          color: #569cd6;
          font-size: 26px;
          margin-bottom: 10px;
        }
        .template-technical .chapter-summary-box {
          color: #6a9955;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .template-technical .section-heading-text {
          color: #9cdcfe;
          font-size: 17px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .template-technical .section-body-content {
          color: #d4d4d4;
          font-size: 14px;
          line-height: 1.8;
          word-break: break-word;
        }

        /* TinyMCE Fixed Top MS Word Ribbon - SCROLL JUMP FIX */
        #ms-word-ribbon-container {
          min-height: 85px;
          width: 100%;
          background: #ffffff;
          position: relative;
          overflow: visible;
        }
        #ms-word-ribbon-container .tox-tinymce-inline {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          opacity: 0 !important;
          display: none !important;
          pointer-events: none !important;
          z-index: 1 !important;
          transition: opacity 0.15s ease-in-out !important;
        }
        #ms-word-ribbon-container .tox-tinymce-inline.tinymce-active-toolbar {
          opacity: 1 !important;
          display: block !important;
          pointer-events: auto !important;
          z-index: 10 !important;
        }
        /* By default show the first toolbar so editor toolbar is directly visible on load */
        #ms-word-ribbon-container:not(.has-active-toolbar) .tox-tinymce-inline:first-of-type {
          opacity: 1 !important;
          display: block !important;
          pointer-events: auto !important;
          z-index: 10 !important;
        }
        #ms-word-ribbon-container .tox .tox-toolbar,
        #ms-word-ribbon-container .tox .tox-toolbar__primary,
        #ms-word-ribbon-container .tox .tox-toolbar__overflow {
          background: #ffffff !important;
          border: none !important;
          flex-wrap: wrap !important;
          gap: 2px !important;
          justify-content: flex-start !important;
        }
        #ms-word-ribbon-container .tox .tox-tbtn {
          border-radius: 4px !important;
          margin: 1px !important;
        }
        #ms-word-ribbon-container .tox .tox-tbtn:hover {
          background: #f1f5f9 !important;
        }
        #ms-word-ribbon-container .tox .tox-tbtn--enabled {
          background: #e0e7ff !important;
          color: #4f46e5 !important;
        }

        /* Rich Content inside Book Sheets */
        .section-body-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 14px;
        }
        .section-body-content table,
        .section-body-content th,
        .section-body-content td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
        }
        .section-body-content th {
          background: rgba(0, 0, 0, 0.05);
          font-weight: 600;
          text-align: left;
        }
        /* Bullet Lists and Numbered Lists - Explicit styling overriding Tailwind Preflight */
        .section-body-content {
          white-space: normal !important;
        }
        .section-body-content p {
          margin: 0 0 8px 0 !important;
        }
        .section-body-content p:last-child {
          margin-bottom: 0 !important;
        }
        .section-body-content ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
          margin: 6px 0 10px 24px !important;
          padding-left: 4px !important;
        }
        .section-body-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
          margin: 6px 0 10px 24px !important;
          padding-left: 4px !important;
        }
        .section-body-content li {
          display: list-item !important;
          margin-bottom: 3px !important;
          line-height: 1.5 !important;
        }
        .section-body-content li p {
          margin: 0 !important;
          display: inline !important;
        }
        .section-body-content blockquote {
          border-left: 4px solid #6366f1;
          padding: 8px 14px;
          margin: 12px 0;
          background: rgba(99, 102, 241, 0.05);
          font-style: italic;
          border-radius: 2px;
        }
        .section-body-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 12px auto;
        }
        .section-body-content code {
          background: rgba(0, 0, 0, 0.06);
          padding: 2px 6px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .section-body-content .mce-pagebreak,
        .section-body-content .pagebreak {
          page-break-after: always;
          break-after: page;
          border-top: 1px dashed #94a3b8;
          margin: 16px 0;
        }
      `}</style>

      {/* ========================================================= */}
      {/* ✨ GOOGLE DOCS GEMINI FLOATING PILL BAR & RESULT CARD      */}
      {/* ========================================================= */}
      {isAiBarVisible ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl flex flex-col items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Floating Result Card (Google Docs AI Preview) */}
          {aiGeneratedResult && (
            <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200/90 ring-4 ring-blue-50/70 p-4 mb-1 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FaWandMagicSparkles className="text-blue-600 text-xs" /> Gemini AI Generated Draft
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
                    for {editableBook?.chapters?.[aiTargetChapterIdx]?.sections?.[aiTargetSectionIdx]?.heading || 'Current Section'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyAiResult}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                    title="Copy to clipboard"
                  >
                    {aiCopied ? <><FaCheck className="text-emerald-500 text-xs" /> <span>Copied!</span></> : <><FaCopy className="text-xs" /> <span>Copy</span></>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiGeneratedResult('')}
                    className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
                    title="Close preview"
                  >
                    <FaXmark className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Rendered HTML content */}
              <div
                className="max-h-52 overflow-y-auto text-xs text-slate-800 leading-relaxed space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-100 shadow-inner font-normal"
                dangerouslySetInnerHTML={{ __html: aiGeneratedResult }}
              />

              {/* Actions: Replace / Insert Below / Regenerate */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleApplyAiToSection('replace')}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FaWandMagicSparkles className="text-xs" /> Replace Section
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAiToSection('append')}
                  className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FaPlus className="text-xs" /> Insert Below
                </button>
                <button
                  type="button"
                  onClick={() => handleFloatingBarSubmit()}
                  disabled={isAiProcessing}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FaRotate className="text-xs" /> Try Again
                </button>
              </div>
            </div>
          )}

          {/* Top Quick Action Chips (Exact Google Docs style from screenshot) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleFloatingBarSubmit('custom', 'Match document style, format and tone perfectly')}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-medium shadow-sm hover:shadow border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <FaPenNib className="text-blue-600 text-xs" />
              <span>Match doc format</span>
            </button>

            <button
              type="button"
              onClick={() => handleFloatingBarSubmit('expand')}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-medium shadow-sm hover:shadow border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <FaWandMagicSparkles className="text-purple-600 text-xs" />
              <span>Expand section</span>
            </button>

            <button
              type="button"
              onClick={() => handleFloatingBarSubmit('rephrase')}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-medium shadow-sm hover:shadow border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <FaPenToSquare className="text-blue-600 text-xs" />
              <span>Polish & rephrase</span>
            </button>

            <button
              type="button"
              onClick={() => handleFloatingBarSubmit('examples')}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-medium shadow-sm hover:shadow border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <FaLightbulb className="text-amber-500 text-xs" />
              <span>Add examples</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPillOptions(prev => !prev)}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-medium shadow-sm hover:shadow border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <FaEllipsis className="text-slate-600 text-xs" />
              <span>More</span>
            </button>
          </div>

          {/* Extended Options Menu when 'More' or '+' is clicked */}
          {showPillOptions && (
            <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-3 mb-1 animate-in zoom-in-95 duration-150 text-xs flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Quick Actions:</span>
                <button
                  type="button"
                  onClick={() => {
                    handleFloatingBarSubmit('generate_chapter', 'Comprehensive Action Plan & Advanced Case Studies');
                    setShowPillOptions(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FaPlus className="text-[10px]" /> Add New Chapter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFloatingBarSubmit('custom', 'Make this text concise, crisp and punchy with key bullet points');
                    setShowPillOptions(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FaBolt className="text-[10px]" /> Make Concise
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFloatingBarSubmit('custom', 'Fix all grammatical errors, elevate vocabulary, and improve clarity');
                    setShowPillOptions(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FaBullseye className="text-[10px]" /> Fix Grammar & Flow
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPillOptions(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1 cursor-pointer flex items-center justify-center"
              >
                <FaXmark className="text-xs" />
              </button>
            </div>
          )}

          {/* Main Google Docs Pill Bar (Exact match to screenshot) */}
          <div className="w-full bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-blue-200/90 ring-4 ring-blue-50/80 px-3.5 py-2 flex items-center gap-2.5 transition-all">
            {/* Plus Icon (+) */}
            <button
              type="button"
              onClick={() => setShowPillOptions(prev => !prev)}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold cursor-pointer shrink-0"
              title="Add / More options"
            >
              <FaPlus className="text-xs" />
            </button>

            {/* Sliders / Tune Icon with Active Target Badge */}
            <div
              className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-blue-50/80 px-2.5 py-1 rounded-full border border-slate-200/80 shrink-0 transition-colors cursor-default"
              title={`Editing Section: ${editableBook?.chapters?.[aiTargetChapterIdx]?.sections?.[aiTargetSectionIdx]?.heading || 'Section'}`}
            >
              <FaSliders className="text-blue-600 font-bold text-xs" />
              <span className="font-semibold text-slate-700 max-w-[130px] sm:max-w-[170px] truncate text-[11px]">
                Ch {(editableBook?.chapters?.[aiTargetChapterIdx]?.chapterNumber) || (aiTargetChapterIdx + 1)} › {editableBook?.chapters?.[aiTargetChapterIdx]?.sections?.[aiTargetSectionIdx]?.heading || 'Section'}
              </span>
            </div>

            {/* Google Docs Text Input */}
            <input
              ref={aiInputRef}
              type="text"
              value={aiPromptInput}
              onChange={e => setAiPromptInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !isAiProcessing && aiPromptInput.trim()) {
                  e.preventDefault();
                  handleFloatingBarSubmit();
                }
              }}
              placeholder="Write, rewrite or edit with AI... [Enter]"
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none px-1"
            />

            {/* Tab Badge */}
            <div className="hidden md:flex items-center text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
              Tab
            </div>

            {/* Options Menu (⋮) */}
            <button
              type="button"
              onClick={() => setShowPillOptions(prev => !prev)}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-sm cursor-pointer shrink-0"
              title="More actions"
            >
              <FaEllipsisVertical className="text-xs" />
            </button>

            {/* Upward Submit Arrow Button */}
            <button
              type="button"
              onClick={() => handleFloatingBarSubmit()}
              disabled={isAiProcessing || (!aiPromptInput.trim() && !aiGeneratedResult)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isAiProcessing
                  ? 'bg-blue-100 text-blue-600'
                  : aiPromptInput.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Submit prompt to Gemini"
            >
              {isAiProcessing ? (
                <FaSpinner className="text-xs animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>

            {/* Minimize / Close Bar */}
            <button
              type="button"
              onClick={() => setIsAiBarVisible(false)}
              className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex items-center justify-center text-xs cursor-pointer shrink-0"
              title="Minimize AI bar"
            >
              <FaXmark className="text-xs" />
            </button>
          </div>
        </div>
      ) : (
        /* Floating Restore Button (when minimized) */
        <button
          type="button"
          onClick={() => {
            setIsAiBarVisible(true);
            setTimeout(() => aiInputRef.current?.focus(), 100);
          }}
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 rounded-full shadow-2xl border border-blue-200 ring-4 ring-blue-50/70 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        >
          <FaWandMagicSparkles className="text-blue-600 text-sm" />
          <span>Help me write (Gemini)</span>
        </button>
      )}

      {/* ========================================================================= */}
      {/* 📄 REAL A4 PDF HIGH-FIDELITY LIVE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showPdfModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Modal Header */}
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <FaFilePdf className="text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-100">
                      Real A4 PDF Live Preview
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      100% Download Fidelity
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {pageWidthMm} × {pageHeightMm} mm ({pageFormat})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Yeh exact wahi PDF file hai jo Puppeteer backend se generate hoti hai. Jaisa yahan dikhega, bilkul wahi download hoga!
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePreviewRealPDF(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Open in new browser tab"
                >
                  <FaArrowUpRightFromSquare className="text-xs" />
                  <span>Open in Tab</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (previewPdfBlobUrl) {
                      const a = document.createElement('a');
                      a.href = previewPdfBlobUrl;
                      a.download = `${(editableBook?.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } else {
                      handleDownloadPDF();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Download this exact PDF"
                >
                  <FaFilePdf className="text-xs" />
                  <span>Download This PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                  title="Close preview"
                >
                  <FaXmark className="text-sm" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF IFrame */}
            <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
              {previewPdfBlobUrl ? (
                <iframe
                  src={previewPdfBlobUrl}
                  className="w-full h-full border-none"
                  title="Real A4 PDF Live Preview"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <FaSpinner className="text-3xl text-indigo-400 animate-spin" />
                  <p className="text-sm font-semibold">Generating exact A4 PDF preview...</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-800 px-4 py-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Section gaps, margins, page breaks and fonts are 100% matched with download.
              </span>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-slate-600"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
