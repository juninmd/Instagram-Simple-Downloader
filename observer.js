/**
 * Main Observer Logic.
 * @namespace ISD_OBSERVER
 */
(function() {
  const U = window.ISD_UTILS;
  const UI = window.ISD_UI;

  // Inject styles immediately
  U.injectStyles();

  const processItems = (container, items) => {
    items.forEach((item, index) => {
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      UI.appendButtons(container, item.src, type, index + 1);
      item.setAttribute('download-button', 'ok');
    });
  };

  const searchFeed = () => {
    const articles = document.querySelectorAll('article');
    articles.forEach((article) => {
      const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
      processItems(article, items);
    });
  };

  const searchStories = () => {
    const section = document.querySelector('section[style]');
    if (!section) return;
    const items = section.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
    items.forEach((item, index) => {
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      UI.appendButtons(item.parentElement, item.src, type, index + 1);
      item.setAttribute('download-button', 'ok');
    });
  };

  const searchProfile = () => {
    const article = document.querySelector('article');
    if (!article) return;
    const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])');
    processItems(article, items);
  };

  const observerCallback = () => {
    const url = window.location.href;
    if (url === 'https://www.instagram.com/') {
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
