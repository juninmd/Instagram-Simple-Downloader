const VIDEO_COLOR = 'linear-gradient(to bottom right, rgb(255, 0, 0), rgb(192, 0, 0))';
const IMAGE_COLOR = 'linear-gradient(to bottom right, rgb(0, 255, 0), rgb(0, 192, 0))';

const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
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

  const iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
  button.innerHTML = iconSvg;

  const span = document.createElement('span');
  span.textContent = `Download #${index}`;
  button.appendChild(span);

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const originalText = span.textContent;
    button.disabled = true;
    button.style.opacity = '0.7';
    span.textContent = 'Downloading...';

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
        button.style.opacity = '';
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
