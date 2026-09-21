const fs = require('fs');
const path = require('path');

const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');

function getScripts() {
  return {
    utilsJs: read('utils.js'),
    uiBaseJs: read('ui-base.js'),
    uiJs: read('ui.js'),
    observerJs: read('observer.js'),
    bgJs: read('background.js')
  };
}

module.exports = {
  read,
  getScripts
};
