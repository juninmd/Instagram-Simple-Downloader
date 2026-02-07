/**
 * Utility functions and constants.
 * @namespace ISD_UTILS
 */
(function() {
  window.ISD_UTILS = {};

  window.ISD_UTILS.CONSTANTS = {
    VIDEO_COLOR: 'linear-gradient(to bottom right, #D32F2F, #C62828)',
    IMAGE_COLOR: 'linear-gradient(to bottom right, #2E7D32, #1B5E20)',
    COPY_COLOR: 'linear-gradient(to bottom right, #0095f6, #0074cc)',
    ICON_DOWNLOAD: `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    ICON_COPY: `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
  };

  /**
   * Helper to create DOM elements.
   * @param {string} tag - Tag name.
   * @param {string} [cls] - Class name.
   * @param {Object} [attrs] - Attributes.
   * @param {Object} [style] - Styles.
   * @returns {HTMLElement}
   */
  window.ISD_UTILS.el = (tag, cls = '', attrs = {}, style = {}) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    Object.assign(e.style, style);
    return e;
  };

  window.ISD_UTILS.injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes isd-spin { to { transform: rotate(360deg); } }
      @keyframes isd-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
      @keyframes isd-pop {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes isd-confetti-explode {
        0% { transform: translate(0,0) scale(1); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
      }
      .isd-spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
        border-radius: 50%; animation: isd-spin 1s linear infinite;
        margin-inline-end: 6px; display: inline-block; box-sizing: border-box;
      }
      .isd-shake { animation: isd-shake 0.4s ease-in-out; }
      .isd-pop { animation: isd-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .isd-confetti {
        position: fixed; width: 6px; height: 6px; border-radius: 50%;
        pointer-events: none; z-index: 10000;
        animation: isd-confetti-explode 0.6s ease-out forwards;
      }
      @media (prefers-reduced-motion: reduce) {
        .isd-spinner, .isd-shake, .isd-pop, .isd-confetti {
          animation: none; transition: none; display: none;
        }
      }
      .isd-hidden { display: none !important; }
      .isd-btn {
        border: 1px solid transparent; color: #fff; padding: 8px 12px;
        border-radius: 4px; cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-weight: 600; font-size: 14px; margin: 8px 4px 8px 0;
        display: inline-flex; align-items: center; justify-content: center;
        transition: all 0.2s ease-in-out; text-decoration: none; line-height: 1;
      }
      .isd-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      .isd-btn:active { transform: translateY(0); }
      .isd-btn[aria-disabled="true"] { cursor: not-allowed; opacity: 0.7; }
      .isd-btn.isd-loading { cursor: progress; opacity: 1; }
      .isd-btn.isd-success { cursor: default; opacity: 1; }
      .isd-btn.isd-error { cursor: pointer; }
    `;
    document.head.appendChild(style);
  };

  window.ISD_UTILS.createConfetti = (rect) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#D32F2F', '#2E7D32', '#0095f6', '#FDD835', '#9C27B0'];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'isd-confetti';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${centerX}px`;
      confetti.style.top = `${centerY}px`;
      const angle = Math.random() * 2 * Math.PI;
      const velocity = 20 + Math.random() * 60;
      const dx = Math.cos(angle) * velocity + 'px';
      const dy = Math.sin(angle) * velocity + 'px';
      confetti.style.setProperty('--dx', dx);
      confetti.style.setProperty('--dy', dy);
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 600);
    }
  };
})();
