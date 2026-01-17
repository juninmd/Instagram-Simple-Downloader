const VIDEO_COLOR = 'linear-gradient(to bottom right, #D32F2F, #C62828)';
const IMAGE_COLOR = 'linear-gradient(to bottom right, #2E7D32, #1B5E20)';

const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes isd-spin {
      to { transform: rotate(360deg); }
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

  Object.assign(button.style, {
    background: type === 'video' ? VIDEO_COLOR : IMAGE_COLOR
  });

  const iconContainer = document.createElement('span');
  iconContainer.innerHTML = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
  const iconSvg = iconContainer.firstElementChild;

  const spinner = document.createElement('span');
  spinner.className = 'isd-spinner isd-hidden';

  const span = document.createElement('span');
  span.setAttribute('aria-live', 'polite');
  span.textContent = `Download #${index}`;

  button.appendChild(iconSvg);
  button.appendChild(spinner);
  button.appendChild(span);

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const originalText = span.textContent;
    button.disabled = true;
    span.textContent = 'Downloading...';
    iconSvg.classList.add('isd-hidden');
    spinner.classList.remove('isd-hidden');

    try {
      await browser.runtime.sendMessage({ url, type });
      span.textContent = 'Started!';
    } catch (error) {
      console.error(error);
      span.textContent = 'Error';
    } finally {
      setTimeout(() => {
        span.textContent = originalText;
        button.disabled = false;
        iconSvg.classList.remove('isd-hidden');
        spinner.classList.add('isd-hidden');
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
