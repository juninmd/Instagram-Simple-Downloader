const VIDEO_COLOR = 'linear-gradient(to bottom right, #D32F2F, #C62828)';
const IMAGE_COLOR = 'linear-gradient(to bottom right, #2E7D32, #1B5E20)';
const COPY_COLOR = 'linear-gradient(to bottom right, #0095f6, #0074cc)';

const ICON_DOWNLOAD = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const ICON_COPY = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes isd-spin {
      to { transform: rotate(360deg); }
    }
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
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: isd-spin 1s linear infinite;
      margin-inline-end: 6px;
      display: inline-block;
      box-sizing: border-box;
    }
    .isd-shake {
      animation: isd-shake 0.4s ease-in-out;
    }
    .isd-pop {
      animation: isd-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .isd-confetti {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      animation: isd-confetti-explode 0.6s ease-out forwards;
    }
    @media (prefers-reduced-motion: reduce) {
      .isd-spinner, .isd-shake, .isd-pop, .isd-confetti {
        animation: none;
        transition: none;
        display: none; /* Hide confetti on reduced motion */
      }
    }
    .isd-hidden {
      display: none !important;
    }
    .isd-btn {
      border: 1px solid transparent;
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 600;
      font-size: 14px;
      margin: 8px 4px 8px 0; /* Added spacing between buttons */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      line-height: 1;
    }
    .isd-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .isd-btn:active {
      transform: translateY(0);
    }
    .isd-btn[aria-disabled="true"] {
      cursor: not-allowed;
      opacity: 0.7;
    }
    .isd-btn.isd-loading {
      cursor: progress;
      opacity: 1;
    }
    .isd-btn.isd-success {
      cursor: default;
      opacity: 1;
    }
    .isd-btn.isd-error {
      cursor: pointer;
      opacity: 1;
    }
    .isd-btn:focus-visible {
      outline: 2px solid #0095f6;
      outline-offset: 2px;
    }
    .isd-btn svg {
      margin-inline-end: 6px;
    }
  `;
  document.head.appendChild(style);
};

injectStyles();

const createConfetti = (rect) => {
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

    // Random direction
    const angle = Math.random() * 2 * Math.PI;
    const velocity = 20 + Math.random() * 60;
    const dx = Math.cos(angle) * velocity + 'px';
    const dy = Math.sin(angle) * velocity + 'px';

    confetti.style.setProperty('--dx', dx);
    confetti.style.setProperty('--dy', dy);

    document.body.appendChild(confetti);

    // Cleanup
    setTimeout(() => confetti.remove(), 600);
  }
};

const createDownloadButton = (url, type, index) => {
  const button = document.createElement('button');
  button.classList.add('download-button', 'isd-btn');

  button.type = 'button';
  button.setAttribute('aria-label', `Download ${type} ${index}`);
  button.setAttribute('title', `Download full resolution ${type}`);

  Object.assign(button.style, {
    background: type === 'video' ? VIDEO_COLOR : IMAGE_COLOR
  });

  const iconContainer = document.createElement('span');
  iconContainer.innerHTML = ICON_DOWNLOAD;
  const iconSvg = iconContainer.firstElementChild;

  const checkContainer = document.createElement('span');
  checkContainer.innerHTML = `<svg aria-hidden="true" class="isd-hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const checkSvg = checkContainer.firstElementChild;

  const spinner = document.createElement('span');
  spinner.className = 'isd-spinner isd-hidden';

  const span = document.createElement('span');
  span.setAttribute('aria-live', 'polite');
  span.textContent = `Download ${type === 'video' ? 'Video' : 'Image'} #${index}`;

  button.appendChild(iconSvg);
  button.appendChild(spinner);
  button.appendChild(checkSvg);
  button.appendChild(span);

  let resetTimer;
  const defaultText = span.textContent;

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (button.getAttribute('aria-disabled') === 'true') return;

    if (resetTimer) clearTimeout(resetTimer);

    button.setAttribute('aria-disabled', 'true');
    button.classList.remove('isd-loading', 'isd-success', 'isd-error', 'isd-shake');
    button.classList.add('isd-loading');
    span.textContent = 'Downloading...';
    button.setAttribute('title', 'Downloading in progress...');
    iconSvg.classList.add('isd-hidden');
    spinner.classList.remove('isd-hidden');

    try {
      await browser.runtime.sendMessage({ url, type });
      button.classList.remove('isd-loading');
      button.classList.add('isd-success');
      span.textContent = 'Started!';
      button.setAttribute('title', 'Download started successfully');
      spinner.classList.add('isd-hidden');
      checkSvg.classList.remove('isd-hidden');
      checkSvg.classList.add('isd-pop');
    } catch (error) {
      console.error(error);
      button.classList.remove('isd-loading');
      button.classList.add('isd-error');
      span.textContent = 'Error';
      button.setAttribute('title', 'Download failed. Click to retry.');
      button.classList.add('isd-shake');
      button.setAttribute('aria-disabled', 'false');
    }

    resetTimer = setTimeout(() => {
      button.classList.remove('isd-loading', 'isd-success', 'isd-error', 'isd-shake');
      span.textContent = defaultText;
      button.setAttribute('aria-disabled', 'false');
      button.setAttribute('title', `Download full resolution ${type}`);
      iconSvg.classList.remove('isd-hidden');
      checkSvg.classList.add('isd-hidden');
      checkSvg.classList.remove('isd-pop');
      spinner.classList.add('isd-hidden');
    }, 2000);
  });
  return button;
};

const createCopyButton = (url, type, index) => {
  const button = document.createElement('button');
  button.classList.add('copy-button', 'isd-btn');

  button.type = 'button';
  button.setAttribute('aria-label', `Copy link for ${type} ${index}`);
  button.setAttribute('title', `Copy link`);

  Object.assign(button.style, {
    background: COPY_COLOR
  });

  const iconContainer = document.createElement('span');
  iconContainer.innerHTML = ICON_COPY;
  const iconSvg = iconContainer.firstElementChild;

  const checkContainer = document.createElement('span');
  checkContainer.innerHTML = `<svg aria-hidden="true" class="isd-hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const checkSvg = checkContainer.firstElementChild;

  const span = document.createElement('span');
  span.setAttribute('aria-live', 'polite');
  span.textContent = `Copy Link`;

  button.appendChild(iconSvg);
  button.appendChild(checkContainer.firstElementChild); // Re-use reference
  button.appendChild(span);

  // We need to re-select the checkSvg because the appendChild above moved it?
  // Actually checkContainer.firstElementChild is just a reference, it's fine.
  // But wait, I appended checkContainer.firstElementChild.
  // Let's just correct the reference.
  const actualCheckSvg = button.querySelector('svg:nth-child(2)');

  let resetTimer;

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (button.getAttribute('aria-disabled') === 'true') return;

    if (resetTimer) clearTimeout(resetTimer);

    try {
      await navigator.clipboard.writeText(url);

      button.setAttribute('aria-disabled', 'true');
      button.classList.add('isd-success');
      span.textContent = 'Copied!';
      button.setAttribute('title', 'Link copied to clipboard');

      iconSvg.classList.add('isd-hidden');
      actualCheckSvg.classList.remove('isd-hidden');
      actualCheckSvg.classList.add('isd-pop');

      // Trigger Confetti
      const rect = button.getBoundingClientRect();
      createConfetti(rect);

    } catch (error) {
      console.error(error);
      button.classList.add('isd-error');
      span.textContent = 'Error';
      button.classList.add('isd-shake');
    }

    resetTimer = setTimeout(() => {
      button.classList.remove('isd-success', 'isd-error', 'isd-shake');
      span.textContent = 'Copy Link';
      button.setAttribute('aria-disabled', 'false');
      button.setAttribute('title', `Copy link`);
      iconSvg.classList.remove('isd-hidden');
      actualCheckSvg.classList.add('isd-hidden');
      actualCheckSvg.classList.remove('isd-pop');
    }, 2000);
  });
  return button;
};

const appendButtons = (container, src, type, index) => {
  const section = container.querySelector('section');
  if (section) {
    // Create wrapper to keep them together if needed, or just prepend both
    // Prepending in reverse order so they appear: [Download] [Copy] or similar.
    // If I prepend Copy then Download, Download will be first (leftmost).

    // Let's create a wrapper div for better layout control
    let wrapper = section.querySelector('.isd-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'isd-wrapper';
      wrapper.style.display = 'flex';
      wrapper.style.flexWrap = 'wrap';
      wrapper.style.marginBottom = '8px';
      section.prepend(wrapper);
    }

    // Prevent duplicate injection in the wrapper if called multiple times?
    // The main logic uses `download-button="ok"` attribute on the ITEM (img/video).
    // So this function is only called once per item.

    // Append Download Button
    wrapper.appendChild(createDownloadButton(src, type, index));
    // Append Copy Button
    wrapper.appendChild(createCopyButton(src, type, index));
  }
};

const searchFeed = () => {
  const articles = document.querySelectorAll('article');
  articles.forEach((article) => {
    const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
    items.forEach((item, index) => {
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      appendButtons(article, item.src, type, index + 1);
      item.setAttribute('download-button', 'ok');
    });
  });
};

const searchStories = () => {
  const items = document.querySelector('section[style]').querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
  items.forEach((item, index) => {
    const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
    appendButtons(item.parentElement, item.src, type, index + 1);
    item.setAttribute('download-button', 'ok');
  });
};

const searchProfile = () => {
  const article = document.querySelector('article');
  const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
  items.forEach((item, index) => {
    const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
    appendButtons(article, item.src, type, index + 1);
    item.setAttribute('download-button', 'ok');
  });
};

const observerCallback = (mutations) => {
  if (window.location.href === 'https://www.instagram.com/') {
    searchFeed();
  } else if (window.location.href.includes('instagram.com/stories')) {
    searchStories();
  } else if (window.location.href.includes('instagram.com/p')) {
    searchProfile();
  }
};

const observer = new MutationObserver(observerCallback);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
