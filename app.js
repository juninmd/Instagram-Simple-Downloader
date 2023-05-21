const VIDEO_COLOR = 'linear-gradient(to bottom right, rgb(255, 0, 0), rgb(192, 0, 0))';
const IMAGE_COLOR = 'linear-gradient(to bottom right, rgb(0, 255, 0), rgb(0, 192, 0))';

const createDownloadButton = (url, type, index) => {
  const button = document.createElement('a');
  button.classList.add('download-button');
  button.style.background = type === 'video' ? VIDEO_COLOR : IMAGE_COLOR;
  button.innerHTML = `<span>Download #${index}</span>`;
  button.addEventListener('click', async (e) => {
    await browser.runtime.sendMessage({ url, type });
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
