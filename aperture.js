/**
 * Aperture visual layer: glass dock, ring progress and spring animations.
 * Loaded after utils.js; layers a second stylesheet over the base styles.
 * @namespace ISD_UTILS
 */
(function() {
  window.ISD_UTILS = window.ISD_UTILS || {};
  const CSS = `
    .isd-wrapper {
      --isd-glass: rgba(255,255,255,.78); --isd-line: rgba(18,20,31,.12); --isd-fg: #12141f;
      width: fit-content; max-width: 100%; align-items: center; gap: 4px;
      padding: 6px; margin-block: 8px !important; border-radius: 22px;
      background: var(--isd-glass); border: 1px solid var(--isd-line);
      -webkit-backdrop-filter: blur(16px) saturate(1.6); backdrop-filter: blur(16px) saturate(1.6);
      box-shadow: 0 10px 40px rgba(0,0,0,.25);
      animation: isd-rise .7s cubic-bezier(.2,.9,.2,1) both;
    }
    @media (prefers-color-scheme: dark) {
      .isd-wrapper { --isd-glass: rgba(20,24,41,.78); --isd-line: rgba(255,255,255,.16); --isd-fg: #eceefa; }
    }
    @keyframes isd-rise { from { opacity: 0; transform: translateY(14px) scale(.92); } }
    .isd-wrapper .isd-btn {
      margin: 0; padding: 10px 14px; border-radius: 16px; border: 0; gap: 8px;
      white-space: nowrap; font-size: 13px; letter-spacing: .01em;
      transition: transform .15s, filter .2s, background .2s;
    }
    .isd-wrapper .isd-btn svg { margin: 0; width: 16px; height: 16px; flex: none; }
    .isd-wrapper .isd-btn:hover { opacity: 1; filter: brightness(1.12); transform: translateY(-1px); }
    .isd-wrapper .isd-btn:active { transform: scale(.94); }
    .isd-wrapper .isd-btn:focus-visible { outline: 2px solid var(--isd-fg); outline-offset: 2px; }
    .isd-wrapper .isd-spinner {
      margin: 0; width: 16px; height: 16px; border-width: 3px;
      border-color: rgba(255,255,255,.3); border-top-color: #fff;
    }
    .isd-wrapper .isd-btn.isd-success { background: #12805c !important; }
    .isd-wrapper .isd-btn.isd-error { background: #c92a2a !important; }
    .isd-wrapper .isd-pop { animation: isd-pop .45s cubic-bezier(.3,1.8,.4,1); }
    @media (prefers-reduced-motion: reduce) { .isd-wrapper { animation: none !important; } }
  `;

  /**
   * Injects the Aperture stylesheet once, after the base styles.
   * @returns {void}
   */
  window.ISD_UTILS.injectAperture = () => {
    if (document.getElementById('isd-aperture')) return;
    const style = document.createElement('style');
    style.id = 'isd-aperture';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  };
})();
