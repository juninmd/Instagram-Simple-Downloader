/**
 * UI Base Components.
 * @namespace ISD_UI
 */
(function() {
  window.ISD_UI = window.ISD_UI || {};
  const U = window.ISD_UTILS, C = U.CONSTANTS, el = U.el;

  /**
   * Creates a standardized, accessible base button with loading, success, and error states.
   * @param {Object} config - Button configuration.
   * @param {string} config.label - Default aria-label and text content for the button.
   * @param {string} config.title - Tooltip text shown on hover.
   * @param {string} config.icon - SVG markup string for the default state icon.
   * @param {string} config.background - CSS background color for the button.
   * @param {Function} config.onClick - Async callback function executed when the button is clicked.
   * @param {string} [config.loadingText='Processing...'] - Text and aria-label shown during async operation.
   * @param {string} [config.successText='Success!'] - Text and aria-label shown on successful completion.
   * @param {string} [config.errorText='Error'] - Text and aria-label shown on error.
   * @param {string} [config.errorTitle='Failed. Click to retry.'] - Tooltip text shown on error.
   * @param {Function} [config.onSuccess] - Optional callback function executed on successful completion. receives the button element.
   * @returns {HTMLButtonElement} The constructed button DOM element.
   */
  window.ISD_UI.createBaseButton = ({ label, title, icon, background, onClick, loadingText = `${label} - Processing...`, successText = `${label} - Success!`, errorText = `${label} - Error`, errorTitle = `${label} - Failed. Click to retry.`, onSuccess }) => {
    const btn = el('button', 'isd-btn', { type: 'button', title }, { background });
    const iconContainer = el('span'); iconContainer.innerHTML = icon;
    const checkContainer = el('span'); checkContainer.innerHTML = C.ICON_CHECK;
    const spinner = el('span', 'isd-spinner isd-hidden');
    const span = el('span', '', { 'aria-live': 'polite', 'aria-atomic': 'true' }); span.textContent = label;
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

        let txt = label;
        let ttl = title;

        if (loading) {
            txt = loadingText;
            ttl = loadingText;
        } else if (success) {
            txt = successText;
            ttl = successText;
        } else if (error) {
            txt = errorText;
            ttl = errorTitle;
        }

        span.textContent = txt;
        btn.title = ttl;
        span.setAttribute('aria-live', error ? 'assertive' : 'polite');
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
})();
