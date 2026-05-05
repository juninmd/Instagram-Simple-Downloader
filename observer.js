/**
 * Main Observer Logic.
 * @namespace ISD_OBSERVER
 */
(function() {
  const U = window.ISD_UTILS;
  const UI = window.ISD_UI;

  // Inject styles immediately
  U.injectStyles();

  const MEDIA_SELECTOR = 'img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])';

  const processItems = (container, items) => {
    let existingCount = container.querySelectorAll('.isd-wrapper [aria-label^="Download"]').length;
    items.forEach((item) => {
      existingCount++;
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      UI.appendButtons(container, item.src, type, existingCount);
      item.setAttribute('download-button', 'ok');
    });
  };

  const searchFeed = () => {
    const articles = document.querySelectorAll('article');
    articles.forEach((article) => {
      const items = article.querySelectorAll(MEDIA_SELECTOR);
      processItems(article, items);
    });
  };

  const searchStories = () => {
    const section = document.querySelector('section[style]');
    if (!section) return;
    const items = section.querySelectorAll(MEDIA_SELECTOR);

    items.forEach((item) => {
      const existingCount = item.parentElement.querySelectorAll('.isd-wrapper [aria-label^="Download"]').length;
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      UI.appendButtons(item.parentElement, item.src, type, existingCount + 1);
      item.setAttribute('download-button', 'ok');
    });
  };

  const searchProfile = () => {
    const article = document.querySelector('article');
    if (!article) return;
    const items = article.querySelectorAll(MEDIA_SELECTOR);
    processItems(article, items);
  };

  const observerCallback = () => {
    try {
      const url = new URL(window.location.href);
      const pathname = url.pathname;

      const isFeedOrReels = pathname === '/' || pathname.startsWith('/reels/');

      if (isFeedOrReels) {
        searchFeed();
      } else if (pathname.startsWith('/stories/')) {
        searchStories();
      } else if (pathname.startsWith('/p/')) {
        searchProfile();
      }
    } catch {
      // Ignore URL parsing errors
    }
  };

  let timeoutId = null;
  const debouncedObserverCallback = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      observerCallback();
      timeoutId = null;
    }, 100);
  };

  const observer = new MutationObserver(debouncedObserverCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  observerCallback();
})();
