const VIDEO_COLOR = 'linear-gradient(to bottom right, #D32F2F, #C62828)';
const IMAGE_COLOR = 'linear-gradient(to bottom right, #2E7D32, #1B5E20)';

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
    .isd-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: isd-spin 1s linear infinite;
      margin-right: 6px;
      display: inline-block;
      box-sizing: border-box;
    }
    .isd-shake {
      animation: isd-shake 0.4s ease-in-out;
    }
    .isd-pop {
      animation: isd-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @media (prefers-reduced-motion: reduce) {
      .isd-spinner, .isd-shake, .isd-pop {
        animation: none;
        transition: none;
      }
    }
    .isd-hidden {
      display: none !important;
    }
    .isd-btn {
      border: none;
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 600;
      font-size: 14px;
      margin: 8px 0;
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
    .isd-btn:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    .isd-btn:focus-visible {
      outline: 2px solid white;
      box-shadow: 0 0 0 4px rgba(0,0,0,0.3);
    }
    .isd-btn svg {
      margin-right: 6px;
    }
  `;
  document.head.appendChild(style);
};

injectStyles();

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
  iconContainer.innerHTML = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
  const iconSvg = iconContainer.firstElementChild;

  const checkContainer = document.createElement('span');
  checkContainer.innerHTML = `<svg aria-hidden="true" class="isd-hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const checkSvg = checkContainer.firstElementChild;

  const spinner = document.createElement('span');
  spinner.className = 'isd-spinner isd-hidden';

  const span = document.createElement('span');
  span.setAttribute('aria-live', 'polite');
  span.textContent = `Download #${index}`;

  button.appendChild(iconSvg);
  button.appendChild(spinner);
  button.appendChild(checkSvg);
  button.appendChild(span);

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const originalText = span.textContent;
    button.disabled = true;
    span.textContent = 'Downloading...';
    button.setAttribute('title', 'Downloading in progress...');
    iconSvg.classList.add('isd-hidden');
    spinner.classList.remove('isd-hidden');

    try {
      await browser.runtime.sendMessage({ url, type });
      span.textContent = 'Started!';
      button.setAttribute('title', 'Download started successfully');
      spinner.classList.add('isd-hidden');
      checkSvg.classList.remove('isd-hidden');
      checkSvg.classList.add('isd-pop');
    } catch (error) {
      console.error(error);
      span.textContent = 'Error';
      button.setAttribute('title', 'Download failed. Click to try again.');
      button.classList.add('isd-shake');
    } finally {
      setTimeout(() => {
        span.textContent = originalText;
        button.disabled = false;
        button.setAttribute('title', `Download full resolution ${type}`);
        iconSvg.classList.remove('isd-hidden');
        checkSvg.classList.add('isd-hidden');
        checkSvg.classList.remove('isd-pop');
        spinner.classList.add('isd-hidden');
        button.classList.remove('isd-shake');
      }, 2000);
    }
  });
  return button;
};

const appendDownloadButton = (container, src, type, index) => {
  const section = container.querySelector('section');
  if (section) {
    section.prepend(createDownloadButton(src, type, index));
  }
};

const searchFeed = () => {
  const articles = document.querySelectorAll('article');
  articles.forEach((article) => {
    const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
    items.forEach((item, index) => {
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      appendDownloadButton(article, item.src, type, index + 1);
      item.setAttribute('download-button', 'ok');
    });
  });
};

const searchStories = () => {
  const items = document.querySelector('section[style]').querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
  items.forEach((item, index) => {
    const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
    appendDownloadButton(item.parentElement, item.src, type, index + 1);
    item.setAttribute('download-button', 'ok');
  });
};

const searchProfile = () => {
  const article = document.querySelector('article');
  const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
  items.forEach((item, index) => {
    const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
    appendDownloadButton(article, item.src, type, index + 1);
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
