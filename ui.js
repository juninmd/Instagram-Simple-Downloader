/**
 * UI Component Logic.
 * @namespace ISD_UI
 */
(function() {
  window.ISD_UI = {};
  const U = window.ISD_UTILS;
  const C = U.CONSTANTS;
  const el = U.el;

  const createBaseButton = ({ label, title, icon, background, onClick, loadingText = 'Processing...', successText = 'Success!', onSuccess }) => {
    const btn = el('button', 'isd-btn', { type: 'button', 'aria-label': label, title }, { background });
    const iconContainer = el('span'); iconContainer.innerHTML = icon;
    const checkContainer = el('span');
    checkContainer.innerHTML = `<svg aria-hidden="true" class="isd-hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const spinner = el('span', 'isd-spinner isd-hidden');
    const span = el('span', '', { 'aria-live': 'polite' }); span.textContent = label;

    // Append children (safely extracting firstElementChild from containers)
    const iconSvg = iconContainer.firstElementChild;
    const checkSvg = checkContainer.firstElementChild;
    [iconSvg, spinner, checkSvg, span].forEach(c => btn.appendChild(c));

    let resetTimer;
    const updateState = (loading, success, error) => {
        btn.setAttribute('aria-disabled', loading ? 'true' : 'false');
        btn.classList.toggle('isd-loading', loading);
        btn.classList.toggle('isd-success', success);
        btn.classList.toggle('isd-error', error);
        btn.classList.toggle('isd-shake', error);

        if (loading) { span.textContent = loadingText; btn.title = loadingText; }
        else if (success) { span.textContent = successText; btn.title = 'Success'; }
        else if (error) { span.textContent = 'Error'; btn.title = 'Failed. Click to retry.'; }
        else { span.textContent = label; btn.title = title; }

        iconSvg.classList.toggle('isd-hidden', loading || success);
        spinner.classList.toggle('isd-hidden', !loading);
        checkSvg.classList.toggle('isd-hidden', !success);
        checkSvg.classList.toggle('isd-pop', success);
    };

    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (btn.getAttribute('aria-disabled') === 'true') return;
      if (resetTimer) clearTimeout(resetTimer);

      updateState(true, false, false);
      try {
        await onClick();
        updateState(false, true, false);
        if (onSuccess) onSuccess(btn);
      } catch (err) {
        console.error(err);
        updateState(false, false, true);
      }
      resetTimer = setTimeout(() => updateState(false, false, false), 2000);
    });
    return btn;
  };

  window.ISD_UI.createDownloadButton = (url, type, index) => {
    return createBaseButton({
      label: `Download ${type === 'video' ? 'Video' : 'Image'} #${index}`,
      title: `Download full resolution ${type}`,
      icon: C.ICON_DOWNLOAD,
      background: type === 'video' ? C.VIDEO_COLOR : C.IMAGE_COLOR,
      loadingText: 'Downloading...',
      successText: 'Started!',
      onClick: async () => await browser.runtime.sendMessage({ url, type })
    });
  };

  window.ISD_UI.createCopyButton = (url) => {
    return createBaseButton({
      label: 'Copy Link',
      title: 'Copy link',
      icon: C.ICON_COPY,
      background: C.COPY_COLOR,
      successText: 'Copied!',
      onClick: async () => await navigator.clipboard.writeText(url),
      onSuccess: (btn) => U.createConfetti(btn.getBoundingClientRect())
    });
  };

  window.ISD_UI.appendButtons = (container, src, type, index) => {
    const target = container.tagName === 'SECTION' ? container : (container.querySelector('section') || container);
    if (!target) return;
    let wrapper = target.querySelector('.isd-wrapper');
    if (!wrapper) {
      wrapper = el('div', 'isd-wrapper', {}, { display: 'flex', flexWrap: 'wrap', marginBottom: '8px', zIndex: 1000, position: 'relative' });
      target.prepend(wrapper);
    }
    wrapper.appendChild(window.ISD_UI.createDownloadButton(src, type, index));
    wrapper.appendChild(window.ISD_UI.createCopyButton(src));
  };
})();
