const downloadBtn = function (url) {
    const el = document.createElement('a');
    el.style = 'color: white;background: #969494; padding: 10px;border-radius: 13px;cursor: pointer;'
    el.innerText = 'Download'
    el.addEventListener("click", (e) =>
        browser.runtime.sendMessage(url)
    )
    return el;
}

const isDaddy = function (daddy) {
    if (daddy.className == '') {
        if (daddy.nextElementSibling == null) {
            return daddy.parentElement.nextElementSibling.firstChild;
        }
        else {
            return null;
        }
    }
    else {
        return isDaddy(daddy.parentElement);
    }
}
const appendBtn = function (el) {
    let daddy = isDaddy(el);
    if (daddy != null)
        daddy.appendChild(downloadBtn(el.src))
}

function retrieveBtn() {
    for (var item of document.querySelectorAll('img[srcset]:not([downloadon="ok"]),video:not([downloadon="ok"])')) {

        if (item.parentElement.parentElement.parentElement.nodeName === "A") {
            item.setAttribute('downloadon', 'ok');
            return;
        }

        appendBtn(item);
        item.setAttribute('downloadon', 'ok');
    }
}

const observer = new MutationObserver((mutations) => {

    if (window.location.href != "https://www.instagram.com/")
        return;

    mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            retrieveBtn();
        }
    });
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});