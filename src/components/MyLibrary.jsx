import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../config';
import { openImageInNewTab } from '../utils/imageViewer';
import {
  FaBookBookmark,
  FaPlus,
  FaBookOpen,
  FaRocket,
  FaMagnifyingGlass,
  FaArrowUpRightFromSquare,
  FaCheck,
  FaPenToSquare,
  FaTrashCan,
  FaSpinner
} from 'react-icons/fa6';

export default function MyLibrary({ onOpenBook, onCreateNew }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/books`);
      if (res.data.success) {
        setBooks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title || 'Untitled'}"?`)) return;

    setDeletingId(id);
    try {
      await axios.delete(`${API}/books/${id}`);
      setBooks(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert('Failed to delete book: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBooks = books.filter(b => 
    (b.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl shadow-sm flex-shrink-0">
              <FaBookBookmark />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">My Saved Books Library</h1>
              <p className="text-gray-500 text-sm">Access, edit, or re-download any of your generated books</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
          />
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 flex-shrink-0"
          >
            <FaPlus className="text-xs" />
            Create New Book
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl animate-bounce">
              <FaBookOpen />
            </div>
          </div>
          <p className="text-gray-600 font-semibold text-base">Loading your library...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && books.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-indigo-100">
            <FaBookBookmark />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No books saved yet</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Generate your very first book with AI and it will automatically be saved here for lifelong access and editing!
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
          >
            <FaRocket className="text-base" /> Write My First Book
          </button>
        </div>
      )}

      {/* Books Grid */}
      {!loading && books.length > 0 && filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No books found matching "{search}"</p>
        </div>
      )}

      {!loading && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(b => (
            <div
              key={b._id}
              onClick={() => onOpenBook(b._id)}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
            >
              {/* Cover Preview Header */}
              <div className="h-48 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 relative overflow-hidden flex items-center justify-center p-4">
                {b.coverImage ? (
                  <>
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      title="View cover in new tab"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageInNewTab(b.coverImage, b.title, b.author);
                      }}
                      className="absolute bottom-3 right-3 bg-slate-950/80 hover:bg-slate-950 text-white px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold flex items-center gap-1 shadow-md cursor-pointer border border-white/10"
                    >
                      <FaMagnifyingGlass className="text-[10px]" /> Cover <FaArrowUpRightFromSquare className="text-[10px]" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-white px-4">
                    <div className="flex justify-center mb-1 text-indigo-300 text-2xl">
                      <FaBookOpen />
                    </div>
                    <p className="font-extrabold text-base line-clamp-2">{b.title}</p>
                    <p className="text-xs text-indigo-300 mt-1 font-medium">by {b.author}</p>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 ${
                    b.status === 'completed'
                      ? 'bg-emerald-500/90 text-white'
                      : b.status === 'processing'
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-gray-500/90 text-white'
                  }`}>
                    {b.status === 'completed' ? (
                      <>
                        <FaCheck className="text-[10px]" /> Ready
                      </>
                    ) : (
                      b.status
                    )}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {b.category || 'General'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {b.title || 'Untitled Book'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Author: <span className="text-gray-700">{b.author || 'Anonymous'}</span>
                  </p>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenBook(b._id)}
                    className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <FaPenToSquare className="text-xs" />
                    <span>Open in Editor</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(b._id, b.title, e)}
                    disabled={deletingId === b._id}
                    className="py-2 px-3 hover:bg-red-50 text-gray-400 hover:text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
                    title="Delete Book"
                  >
                    {deletingId === b._id ? <FaSpinner className="animate-spin text-xs" /> : <FaTrashCan className="text-xs" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
