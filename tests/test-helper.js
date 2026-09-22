const fs = require('fs');
const path = require('path');

let cache = null;

function getScripts() {
  if (cache) return cache;
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  cache = {
    utilsJs: read('utils.js'),
    uiBaseJs: read('ui-base.js'),
    uiJs: read('ui.js'),
    observerJs: read('observer.js'),
    bgJs: read('background.js'),
  };
  return cache;
}

module.exports = { getScripts };
