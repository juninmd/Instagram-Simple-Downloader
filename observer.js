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
    const url = window.location.href;

    const isFeedOrReels = url === 'https://www.instagram.com/' ||
                          url.includes('instagram.com/?') ||
                          url.includes('instagram.com/reels');

    if (isFeedOrReels) {
      searchFeed();
    } else if (url.includes('instagram.com/stories')) {
      searchStories();
    } else if (url.includes('instagram.com/p')) {
      searchProfile();
    }
  };

  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  observerCallback();
})();
