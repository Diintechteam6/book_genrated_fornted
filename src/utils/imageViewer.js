/**
 * Utility to reliably open high-resolution book cover images in a new browser tab.
 * Works seamlessly with Base64 data URLs, SVGs, Blob URLs, and external HTTP URLs
 * without triggering Chrome's "Not allowed to navigate top frame to data URL" restriction
 * or pop-up blocker issues.
 */

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function openImageInNewTab(imageUrl, title = 'Book Cover', author = '') {
  if (!imageUrl) return;

  const pageTitle = title ? `${title} - Front Cover Preview` : 'Book Front Cover Preview';
  const cleanFilename = (title || 'book_cover')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'book_cover';

  // Build a self-contained responsive viewer page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0f19;
      background-image: radial-gradient(#1e293b 1px, transparent 1px);
      background-size: 24px 24px;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 74px 20px 36px;
      user-select: none;
      overflow-x: hidden;
    }
    .topbar {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 8px 20px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.7);
      z-index: 100;
      max-width: 92vw;
    }
    .book-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .book-title {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 320px;
    }
    .book-author {
      font-size: 11px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 320px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      border: none;
      white-space: nowrap;
    }
    .btn-download {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
    .btn-download:hover {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      transform: translateY(-1px);
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }
    .btn-close:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }
    .image-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 90vw;
      max-height: 84vh;
      cursor: zoom-in;
      transition: all 0.2s ease;
    }
    .image-wrapper.zoomed {
      max-width: none;
      max-height: none;
      cursor: zoom-out;
      margin-top: 50px;
      margin-bottom: 50px;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: 84vh;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 14px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1);
      transition: transform 0.2s ease;
    }
    .image-wrapper.zoomed img {
      max-width: none;
      max-height: none;
      border-radius: 8px;
    }
    .hint {
      position: fixed;
      bottom: 16px;
      font-size: 11px;
      color: #94a3b8;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      padding: 5px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      pointer-events: none;
      z-index: 90;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="book-meta">
      <span class="book-title">📖 ${escapeHtml(title || 'Book Front Cover')}</span>
      ${author ? `<span class="book-author">by ${escapeHtml(author)}</span>` : ''}
    </div>
    <div class="actions">
      <a class="btn btn-download" href="${imageUrl}" download="${cleanFilename}_cover.png" title="Download High-Res Cover">
        <span>⬇️</span> Download
      </a>
      <button class="btn btn-close" onclick="window.close()" title="Close Tab">
        <span>✕</span> Close
      </button>
    </div>
  </div>

  <div class="image-wrapper" id="imgWrapper" title="Click image to zoom in / out" onclick="this.classList.toggle('zoomed')">
    <img src="${imageUrl}" alt="${escapeHtml(title || 'Book Cover')}" />
  </div>

  <div class="hint">🔍 Click image to zoom in/out • Press Esc to close</div>

  <script>
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });
  </script>
</body>
</html>`;

  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    // Open via window.open
    const win = window.open(blobUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Fallback in case popup blocker interrupted window.open
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Revoke object URL after 3 minutes
    setTimeout(() => URL.revokeObjectURL(blobUrl), 180000);
  } catch (err) {
    console.error('Failed to open preview tab with Blob:', err);
    // Fallback: direct window.open
    window.open(imageUrl, '_blank');
  }
}

export default openImageInNewTab;
