const color = (type) => {
    return type === 'video' ? 'linear-gradient(to bottom right, rgb(255, 0, 0), rgb(192, 0, 0))' : 'linear-gradient(to bottom right, rgb(0, 255, 0), rgb(0, 192, 0))';
}

const feed = () => {
    const downloadBtn = function (url, type, i) {
        const el = document.createElement('a');
        el.style = `color: white;background: ${color(type)}; padding-top: 8px;border-radius: 4px;cursor: pointer;margin-right: 10px;border: 1px solid #090909 !important;height: 25px;width: auto;padding-left: 3px;padding-right: 3px;`
        el.innerText = `Download #${i}`
        el.addEventListener("click", (e) =>
            browser.runtime.sendMessage({ url, type })
        )
        return el;
    }

    const appendBtn = (article, src, type, i) => {
        const section = article.querySelector('section');
        if (section != null)
            section.prepend(downloadBtn(src, type, i))
    }

    const search = () => {
        for (const article of document.querySelectorAll('article')) {
            const items = article.querySelectorAll('img[srcset]:not([download-button="ok"]),video:not([download-button="ok"])')
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.nodeName === 'VIDEO') {
                    appendBtn(article, item.src, 'video', i + 1);
                    item.setAttribute('download-button', 'ok');
                } else {
                    appendBtn(article, item.src, 'image', i + 1);
                    item.setAttribute('download-button', 'ok');
                }
            }
        }
    }
    return { search };
}

const stories = () => {
    const downloadBtn = function (url, type) {
        const el = document.createElement('a');
        el.style = `color: white;background: ${color(type)}; border-radius: 4px;cursor: pointer;margin-right: 10px;border: 1px solid #090909 !important;padding-left: 3px;padding-right: 3px; margin-left: 4px;`
        el.innerText = `Download`
        el.addEventListener("click", (e) =>
            browser.runtime.sendMessage({ url, type })
        )
        return el;
    }

    const appendBtn = (src, type) => {
        document.querySelector('time').parentElement.append(downloadBtn(src, type))
    }

    const search = () => {
        const items = document.querySelector('section[style]').querySelectorAll('video:not([download-button="ok"]),img[srcset]:not([download-button="ok"])')
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.nodeName === 'VIDEO') {
                appendBtn(item.querySelectorAll('source')[1].src, 'video');
                item.setAttribute('download-button', 'ok');
            } else {
                appendBtn(item.src, 'image');
                item.setAttribute('download-button', 'ok');
            }
        }
    }
    return { search };
}

const profile = () => {
    const downloadBtn = function (url, type, i) {
        const el = document.createElement('a');
        el.style = `color: white;background: ${color(type)}; padding-top: 8px;border-radius: 4px;cursor: pointer;margin-right: 10px;border: 1px solid #090909 !important;height: 25px;width: auto;padding-left: 3px;padding-right: 3px;`
        el.innerText = `#${i}`
        el.addEventListener("click", (e) =>
            browser.runtime.sendMessage({ url, type })
        )
        return el;
    }

    const appendBtn = (article, src, type, i) => {
        const section = article.querySelector('section');
        if (section != null)
            section.prepend(downloadBtn(src, type, i))
    }

    const search = () => {
        const article = document.querySelector('article');
        const items = article.querySelectorAll('video:not([download-button="ok"]),img[srcset]:not([download-button="ok"])');
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.nodeName === 'VIDEO') {
                appendBtn(article, item.src, 'video', i + 1);
                item.setAttribute('download-button', 'ok');
            } else {
                appendBtn(article, item.src, 'image', i + 1);
                item.setAttribute('download-button', 'ok');
            }
        }
    }

    return { search };
}

const observer = new MutationObserver((mutations) => {

    if (!(window.location.href === "https://www.instagram.com/" ||
        window.location.href.includes('instagram.com/stories') ||
        window.location.href.includes('instagram.com/p'))) {
        return;
    }

    mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            if (window.location.href.includes('instagram.com/stories')) {
                stories().search();
            } else if (window.location.href === "https://www.instagram.com/") {
                feed().search();
            } else if (window.location.href.includes('instagram.com/p')) {
                profile().search();
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});