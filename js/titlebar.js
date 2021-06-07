// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;

var tabCount;
var showAlert;
var tabCountCache;
exports.setData = function (tc, sa, chm) {
tabCount = tc;
showAlert = sa;
tabCountCache = chm;
}

// When document has loaded, initialise
document.onreadystatechange = () => {
if (document.readyState == "complete") {
init();
}
};

function init() {
let window = remote.getCurrentWindow();
const minButton = document.getElementById('min-button'),
maxButton = document.getElementById('max-button'),
restoreButton = document.getElementById('restore-button'),
closeButton = document.getElementById('close-button');

minButton.addEventListener("click", event => {
window = remote.getCurrentWindow();
window.minimize();
});

maxButton.addEventListener("click", event => {
window = remote.getCurrentWindow();
window.maximize();
toggleMaxRestoreButtons();
});

restoreButton.addEventListener("click", event => {
window = remote.getCurrentWindow();
window.unmaximize();
toggleMaxRestoreButtons();
});

// Toggle maximise/restore buttons when maximisation/unmaximisation
// occurs by means other than button clicks e.g. double-clicking
// the title bar:
toggleMaxRestoreButtons();
try {
window.on('maximize', toggleMaxRestoreButtons);
} catch (e) { }
window.on('maximize', toggleMaxRestoreButtons);
window.on('unmaximize', toggleMaxRestoreButtons);

/* Ust Tuş Uygulama Kapat */
closeButton.addEventListener("click", event => {
var { app } = remote;
// app.quit();
win = remote.getCurrentWindow();

let closeWindow = function () { win.close(); };
//if(document.title == 'Holla Main Window') 
closeWindow = function () { app.quit(); };

let tc; let cbNums; let pageNumberOnlys;
try {
tc = tabCount(); 
cbNums = tabCountCache();
pageNumberOnlys = store.get('tabslengthOnlys');
} catch (e) {
closeWindow();
return;
}

if(!store.get('settings.closedAllExitWarnig')){ pageNumberOnlys = 1; }
if(pageNumberOnlys && pageNumberOnlys > 1) {
let input = { message: 'Kapatmak istediğinden emin misin ' + pageNumberOnlys + ' sekme açık?', type: 'confirm',	url: 'Holla' };
showAlert(input, r => { if(r) {closeWindow()} });
} else {
closeWindow();
}
});

function toggleMaxRestoreButtons() {
window = remote.getCurrentWindow();
if (window.isMaximized()) {
maxButton.style.display = "none";
restoreButton.style.display = "flex";
} else {
restoreButton.style.display = "none";
maxButton.style.display = "flex";
}
}
}