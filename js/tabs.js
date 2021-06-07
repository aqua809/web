// PACKAGE LOADING
const { remote, ipcRenderer } = require('electron');
const { dialog } =  require('electron').remote;

const { v1 } = require('uuid'); // Şifrele Method 1
const base64KeysTo = require('./base64.min.js'); // Şifrele Method 2

var i18n = new(require('./../translations/i18n-ex'));

// INITIALIZE LOCAL SCRIPTS:
const web = require('./web'); // Used for managing webpage loading and websites
const storage = require('./store'); // Manages bookmark and history storage

const { BrowserView, BrowserWindow, ipcMain, Menu } = remote;
const contextMenu = require('electron-context-menu');

const { join } = require('path'); // Helps create full paths to local files

//const fs = require('fs');
const tabs = require('./tabs.js');

remote.app.on('browser-window-created',function(e,window) {
window.setMenu(null);
window.nativeWindowOpen = false;
});

const win = remote.getCurrentWindow(); // Grabs the Holla window

function realNowtopbarHeight() {
let topBarOlcus = 70;
if(store.get('settings.topbarHeight')){ topBarOlcus = store.get('settings.topbarHeight'); }
return topBarOlcus;
}

let topbarHeight = realNowtopbarHeight();

let Sortable = require('sortablejs'); // Library for draggable/sortable elements
//var sortable = new Sortable(document.getElementById('tabs')); // Make the tabs draggable/sortable
var el_ssort = document.getElementById("tabs");
var sortable = new Sortable(el_ssort, {
animation: 150,
ghostClass: 'blue-background-class',
direction: 'horizontal',
draggable: '.tab'
});

exports.tabs = []; // Array of all open tabs
var closedTabs = []; // Array of previously closed tabs, used in the Reopen Closed Tab shortcut
var activeTab; // Currently selected tab
var downloadWindow; // Stores the downloads window globall

// Initialize the downloads window:
exports.initDownloads = async () => {
downloadWindow = new BrowserWindow({
frame: false,
transparent: true,
resizable: false,
width: window.outerWidth,
height: 70,
x: 0,
y: window.outerHeight - 70,
parent: remote.getCurrentWindow(),
show: false,
hasShadow: false,
webPreferences: {
nodeIntegration: true,
enableRemoteModule: true
}
});

downloadWindow.loadURL(require('url').format({
pathname: join(__dirname, '../static/pages/dialogs/download.html'),
protocol: 'file:',
slashes: true
}));

//downloadWindow.openDevTools({ mode: "detach" });
}

// Decide whether file should be viewer (pdf) or downloaded:
exports.handleDownload = async (event, item, webContents) => {

if(!store.get('setDowloandLoads')){
store.set('setDowloandLoads', true);
setTimeout(function(){ store.set('setDowloandLoads', false); }, 200);

/*
let filters = [
{ name: 'Web Sayfası, Tamamı', extensions: ['htm', 'html'] },
{ name: 'Web Sayfası, Yalnızca HTML', extensions: ['html', 'htm'] },
{ name: 'Web Sayfası, Tek Dosya', extensions: ['mhtml'] },
{ name: 'Resim', extensions: ['jpg', 'png', 'gif'] },
{ name: 'Video', extensions: ['mkv', 'avi', 'mp4'] },
{ name: 'Custom File Type', extensions: ['as'] },
{ name: 'Tüm Dosyalar', extensions: ['*'] }
];

let options = {
title: 'Farklı Kaydet',
defaultPath: store.get('appGetPath')+'\\'+item.getFilename(),
filters: filters
//message: "Please pick your poison",
};

item.setSaveDialogOptions(options); 
*/

//item.setSavePath(store.get('appGetPath'));
item.setSavePath(store.get('appGetPath')+'\\'+item.getFilename());
item.pause();
this.resumeOnLives = false;
this.downloadWindowShows = false;


let itemAddress = item.getURL();
/*
if(item.getMimeType() === 'application/pdf' && itemAddress.indexOf('blob:') !== 0 && itemAddress.indexOf('#pdfjs.action=download') === -1) {
event.preventDefault();
let query = '?file=' + encodeURIComponent(itemAddress);
this.current().webContents.loadURL(join(__dirname, '..', 'static', 'pdf', 'index.html') + query);
} else {}
*/
var savePath;



if(!this.downloadWindowShows){
if (store.get('settings.dowloadnAltPencere')) { downloadWindow.show(); }
this.downloadWindowShows = true;
}

//let id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
let id = v1();
downloadWindow.webContents.send('newDownload', id, item.getFilename(), itemAddress, item.getTotalBytes(), item.getMimeType());
storage.addDownloads(id, item.getFilename(), '', item.getURL(), item.getTotalBytes(), item.getMimeType(), 'wait');

item.on('updated', (event, state) => {
if(!this.resumeOnLives){ 
item.resume(); 
this.resumeOnLives = true; 
}


if (state === 'interrupted') { 
if (store.get('settings.dowloadnAltPencere')) { downloadWindow.webContents.send('stoppedDownload', id, state); }
} else if (state === 'progressing') { 
savePath = item.savePath;
if (item.isPaused()) {  
if (store.get('settings.dowloadnAltPencere')) { downloadWindow.webContents.send('stoppedDownload', id, 'paused'); }
} else {  
let percentage = (item.getReceivedBytes() / item.getTotalBytes()) * 100;
if (store.get('settings.dowloadnAltPencere')) { downloadWindow.webContents.send('updateDownload', id, percentage, item.getReceivedBytes(), item.getTotalBytes()); }
if(tabs.current().webContents.getURL() == 'holla://indirilenler'){
tabs.current().webContents.send('updateDownload', id, percentage, item.getReceivedBytes(), item.getTotalBytes());
}
}
}


});

ipcMain.once('cancel-download-' + id, () => { 
item.cancel();  
storage.StatusDownloads(id, 'cancel-download');

/*
if (fs.existsSync(savePath)) {
fs.unlink(savePath, (err) => {
if (err) {
console.log("An error ocurred updating the file" + err.message);
console.log(err);
} else { console.log("File succesfully deleted"); }
});
} else {
console.log("This file doesn't exist, cannot delete");
}
*/

});

ipcMain.once('getCurrentWindowHides', () => { 
this.downloadWindowShows = false;
});


item.once('done', (event, state) => {
if (state === 'completed') {
console.log(savePath);
if (store.get('settings.dowloadnAltPencere')) { downloadWindow.webContents.send('completeDownload', id, savePath); }
storage.SavePathDownloads(id, savePath.replace(/\\/g, "/"));
storage.StatusDownloads(id, 'completed');
if(tabs.current().webContents.getURL() == 'holla://indirilenler'){
tabs.current().webContents.send('completeDownload', id, savePath.replace(/\\/g, "/"));
}
this.resumeOnLives = false; 
} else {
if (store.get('settings.dowloadnAltPencere')) { downloadWindow.webContents.send('failedDownload', id); }
storage.StatusDownloads(id, 'failed');
if(tabs.current().webContents.getURL() == 'holla://indirilenler'){
tabs.current().webContents.send('failedDownload', id);
}
this.resumeOnLives = false; 
}
});


}
}

// Opens a recently closed tab:
exports.openClosedTab = function () {
if(closedTabs.length == 0) return;
let item = closedTabs[closedTabs.length-1];
this.newView(item);

const index = closedTabs.indexOf(item);
if (index > -1) closedTabs.splice(index, 1);
}

// Returns the current tab:
exports.current = function () {
return activeTab;
}

// Initializes a view with bindings from web.js:
exports.initBrowserView = async (view) => {
view.webContents.on('did-start-loading', async () => { web.loadStart(view) });
view.webContents.on('did-stop-loading', async () => { web.loadStop(view) });
view.webContents.on('did-fail-load', async (e, ec, ed, vu) => {web.failLoad(e, view, ec, ed, vu); });
view.webContents.on('enter-html-full-screen', async () => {  web.enterFllscrn(view, remote.screen) });
view.webContents.on('leave-html-full-screen', async () => {  web.leaveFllscrn(view, win.getBounds().height) });
view.webContents.on('dom-ready', async () => { web.domReady(view, storage) });

view.webContents.on('did-finish-load', () => {
//view.webContents.executeJavaScript(``);
});

view.webContents.on('new-window', async (e, url, f, disposition, frameName) => {
//e.preventDefault();
//if(url != 'javascript:void(0);'){}
// disposition = foreground-tab    f = _self
/*
console.log(e);
console.log(url);
console.log(f);
console.log(disposition);
console.log(frameName);*/
if(!frameName){ 
switch (disposition) {
case 'background-tab':
this.newView(url, false);
break;
default:
this.newView(url);
break;
}
}
});

// view.webContents.on('page-favicon-updated', async (e) => { web.faviconUpdated(view, e.favicons) });
view.webContents.on('page-title-updated', async (e, t) => { web.titleUpdated(view, e, t) });
view.webContents.on('did-navigate', async (e, url) => { web.didNavigate(url, view, storage) });
view.webContents.on('did-navigate-in-page', async (e, url) => { web.didNavigate(url, view, storage) });
view.webContents.on('preload-error', async (e, path, err) => { console.error("PRELOAD ERROR", err); });

//view.webContents.session.on('before-download', (event, item, webContents) => {});
view.webContents.session.on('will-download', this.handleDownload);
//view.webContents.session.on('will-download', async (event, item, webContents) => { willDowloandss(event, item, webContents); });

view.webContents.on('certificate-error', async (e, url, err) => {
e.preventDefault();
console.log(err);
});
}

// Saves an HTML page:
exports.savePage = function(contents) {
let filters = [
{ name: i18n.__('Web Sayfası, Tamamı'), extensions: ['htm', 'html'] },
{ name: i18n.__('Web Sayfası, Yalnızca HTML'), extensions: ['html', 'htm'] },
{ name: i18n.__('Web Sayfası, Tek Dosya'), extensions: ['mhtml'] }
];

let options = {
title: i18n.__('Farklı Kaydet'),
defaultPath: this.current().webContents.getTitle(),
filters: filters
};

dialog.showSaveDialog(options).then((det) => {
if(!det.cancelled){
let path = det.filePath;
let saveType;
if(path.endsWith('htm')) saveType = 'HTMLComplete';
if(path.endsWith('html')) saveType = 'HTMLOnly';
if(path.endsWith('mhtml')) saveType = 'MHTML';

contents.savePage(path, saveType).then(() => {
let input = { message: i18n.__('Sayfa başarıyla kaydedildi.'), type: 'alert',	url: 'Holla' };
ipcRenderer.send('alert',input);
}).catch(err => { console.error(err) });
}
});
}

// Activate (select) a certain tab:
exports.activate = function (view) {
let win = remote.getCurrentWindow();
let views = win.getBrowserViews();
for (let i = 0; i < views.length; i++) {
if(views[i].type == 'tab') win.removeBrowserView(views[i]);
}
win.addBrowserView(view);
document.getElementById('url').value = '';

this.viewActivated(view);

if(document.getElementsByClassName('selected')[0]) {
document.getElementsByClassName('selected')[0].classList.remove('selected');
}

view.tab.element.classList.add('selected');
activeTab = view;

// Synchronize view size with parent window size:
//Code in Mac, Makes pages appear when navigating between tabs 
topbarHeight = realNowtopbarHeight();
view.setBounds({x:0, y:topbarHeight, width:win.getContentBounds().width, height:win.getContentBounds().height - topbarHeight });
}

// Close a tab:
exports.close = async (view) => { 

view = view || this.current();

if(activeTab == view) {
let id = this.tabs.indexOf(view);
let length = this.tabs.length;

if (length == 1) { remote.app.quit(); return; }

let nextTab = (id != 0) ? this.tabs[id - 1] : this.tabs[id + 1];
this.activate(nextTab);
}

view.tab.element.remove();

closedTabs.push(view.webContents.getURL());

this.viewClosed(view);
//view.destroy();
view.webContents.destroy();
}

// Create a new tab:
exports.newView = function (url='holla://yeni-sekme', active=true) {

// USER AGENT RANDOMIZATION
let version = Math.floor(Math.random() * (69 - 53) + 53); // Grab a random number from 68 to 53 inclusive
// Use the number above as your 'Firefox version' user agent:
var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:' + version + '.0) Gecko/20100101 Firefox/' + version + '.0';

// BROWSERVIEW CREATION
let view = new BrowserView({
frame: false,
webPreferences: {
nodeIntegration: false,
//webviewTag: true,
nativeWindowOpen: false,
nodeIntegrationInSubFrames: false,
'plugins': true,
webSecurity: true,
worldSafeExecuteJavaScript: true,
executeJavaScript: true,
spellcheck: true,
preload: join(__dirname, 'preload.js')
}
});

let tabSession = view.webContents.session;

view.webContents.setUserAgent(userAgent, "tr,tr-TR,en-US,fr,de,ko,zh-CN,ja");

// WEBRTC IP HANDLING POLICY
view.webContents.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');
topbarHeight = realNowtopbarHeight();

// Synchronize view size with parent window size:
view.setBounds({x:0, y:topbarHeight, width:win.getContentBounds().width, height:win.getContentBounds().height - topbarHeight });

win.on('resize', () => {
view.setBounds({x:0, y:topbarHeight, width:win.getContentBounds().width, height:win.getContentBounds().height - topbarHeight });
});

// consider all urls for integrated authentication. '*googleapis.com, *google.com, *google'
tabSession.allowNTLMCredentialsForDomains('*');

// HEADER CONFIGURATION
const filter = { 
urls: [
'*://*.google.com/*', 
'*://*.google.com.tr/*', 
'*://*.googleapis.com/*',
'*://*.gstatic.com/*'
] 
}; 

tabSession.webRequest.onBeforeSendHeaders(filter, (det, callback) => {
/*
// İstek HTTP ise ve yalnızca https modu etkinleştirilmişse
// If request is HTTP and https-only mode is enabled
if(det.url.substr(0,5) == 'http:' && store.get('flags').includes('--https-only')) {
// Cancel the request
callback({ cancel: true }); 
// Web sitesi isteklerini HTTPS'ye yönlendirin
// Redirect website requests to HTTPS
if(det.resourceType == 'mainFrame') view.webContents.loadURL('https' + det.url.substr(4)); 
} else if('Content-Type' in det.requestHeaders && store.get('flags').includes('--no-pings')) { // If pings are disabled
if(det.requestHeaders['Content-Type'][0] == 'text/ping') callback({ cancel: true }); // If this request is a ping, cancel it
} else {
} 
*/
let headers = det.requestHeaders;
if(store.get('flags').includes('--no-referrers')) headers['Referer'] = ''; // Omit 'Referer' header when 'no-referrers' flag is enabled
if(store.get('flags').includes('--do-not-track')) headers['DNT'] = '1'; // Enable DNT for 'do-not-track' flag
headers['Access-Control-Allow-Headers'] = '*';
headers['Access-Control-Allow-Origin'] = '*';
headers['Access-Control-Allow-Credentials'] = true;
headers['Accept'] = '*/*';
headers['Accept-Language'] = store.get('settings.langs');+', tr-TR;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'; 
// tr-TR,tr;q=0.9 Normalize the 'Accept-Language' header to prevent browser fingerprinting
headers['User-Agent'] = userAgent; // Randomize the user agent to throw websites off your tracks
callback({ cancel: false, requestHeaders: headers }); // Don't cancel the request but use these modified headers instead
});


// THIRD-PARTY COOKIE BLOCKING - Geliştirilicek, google.com, google.com.tr oturum açma çerez engelli
/*
tabSession.cookies.on('changed', async (e, cookie, cause, rem) => {
if(!rem) {
let split = cookie.domain.split('.');
let domain = split[split.length - 2] + '.' + split[split.length - 1];
try {
split = (new URL(view.webContents.getURL())).host.split('.');
let host = split[split.length - 2] + '.' + split[split.length - 1];
if(domain != host) {
tabSession.cookies.remove(view.webContents.getURL(), cookie.name);
}
} catch (error) {
console.log('### COOKIE OOF')
}
}
});
*/

// CUSTOM PROTOCOLS
tabSession.protocol.registerHttpProtocol('ipfs', (req, cb) => {
var hash = req.url.substr(7);
cb({ url: 'https://ipfs.io/ipfs/' + hash });
}, () => {});

// PDF READER , JSON VİEWWER
tabSession.webRequest.onResponseStarted(async (det) => {
let type = det.responseHeaders['Content-Type'] || det.responseHeaders['content-type'];
let resource = det.resourceType;

if(!resource || !type) return;
let query = '?url=' + encodeURIComponent(det.url);
if(resource == 'mainFrame' && type[0].includes('application/json')) {
if(store.get('settings.json_viewer')){ 
view.webContents.loadURL(join(__dirname, '..', 'static', 'json-viewer', 'index.html') + query);
}
} else if (resource == 'mainFrame' && type[0].includes('application/pdf')) {
//view.webContents.loadURL(join(__dirname, '..', 'static', 'pdf', 'index.html') + query);
}
});


/*
tabSession.protocol.interceptFileProtocol('chrome-extension', async (req, cb) => {
if(!req.url.includes('mhjfbmdgcfjbbpaeojofohoefgiehjai')) return;
let relative = req.url.replace('chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/', '');
cb(join(__dirname, '..', 'static', 'pdf', relative));
});
*/

// tabSession.protocol.registerFileProtocol('pdf', (req, cb) => {
//   var url = req.url.substr(6);
//   let result = join(__dirname, '../static/pdf/', url);
//   console.log(result);
//   cb(result); // + '' + url
// }, (error) => {});

tabSession.protocol.registerFileProtocol('assets', (req, cb) => {
var url = req.url.replace(new URL(req.url).protocol, '');

if(url.includes('..')) {
cb(join(__dirname, '../css/favicon.png'));
} else {
cb(join(__dirname, '../css/', url));
}
}, () => {});

tabSession.protocol.registerFileProtocol('holla', (req, cb) => {
var url = new URL(req.url);
if(url.hostname == 'network-error') {
cb(join(__dirname, '../static/pages/', `network-error.html`));
} else {
url = req.url.replace(url.protocol, '');
cb(join(__dirname, '../static/pages/', `${ url }.html`));
}
}, () => {});

// CLOSE HANDLING
ipcMain.on('closeCurrentTab', async (e, id) => { 
if(id == view.webContents.id) this.close(view);
});

// CONTEXT (RIGHT-CLICK) MENU
contextMenu({
//window  : view.webContents,
window  : view,
prepend: (defaultActions, params, WebContents) => [
{
label: i18n.__('Geri'),
accelerator: 'Alt+Left',
visible: params.selectionText.length == 0,
enabled: view.webContents.canGoBack(),
click: async () => { view.webContents.goBack(); }
},
{
label: i18n.__('İleri'),
accelerator: 'Alt+Right',
visible: params.selectionText.length == 0,
enabled: view.webContents.canGoForward(),
click: async () => { view.webContents.goForward(); }
},
{
label: i18n.__('Yeniden Yükle'),
accelerator: 'CmdOrCtrl+R',
visible: params.selectionText.length == 0,
click: async () => { view.webContents.reload(); }
},
{
type: 'separator'
},
{
label: i18n.__('Farklı Kaydet'),
accelerator: 'CmdOrCtrl+S',
visible: params.selectionText.length == 0,
click: async () => { this.savePage(view.webContents); }
},
{
type: 'separator'
},
{
label: i18n.__('Resmi Yeni Sekmede Aç'),
visible: params.mediaType === 'image',
click: async () => { this.newView(params.srcURL); /* view.webContents.loadURL(params.srcURL); */ }
},
{
label: i18n.__('Bağlantıyı Yeni Sekmede Aç'),
visible: params.linkURL.length > 0,
click: async () => { this.newView(params.linkURL); }
},
{
label: i18n.__('Google İle Ara')+' “{selection}”',
visible: params.selectionText.trim().length > 0,
click: async () => { this.newView(`https://www.google.com/search?q=${encodeURIComponent(params.selectionText)}`); }
},
{
label: i18n.__('Sayfa Kaynağını Görüntüle'),
visible: view.webContents.getURL().includes('holla://') == false,
click: async () => { 
let currentURL = view.webContents.getURL();
$.get(currentURL, async (data,status,xhr) => {
store.set('viewSourceMAINCode', data);
store.set('viewSourceURL', currentURL);
this.newView('holla://kaynagi-goruntule');
});
}
},
{
label: i18n.__('İncele'),
visible: view.webContents.getURL().includes('holla://') == false,
click: async () => { 
view.webContents.openDevTools({ mode: 'bottom' }); /* detach */
}
}
],
labels: {
//spellCheck: 'xxx-spellCheck',
//learnSpelling: 'xxx-learnSpelling',
//separator: 'xxx-altBoşlukÇizgi',
lookUpSelection: i18n.__('Danışın')+' “{selection}”',
searchWithGoogle: i18n.__('Google İle Ara'),
cut: i18n.__('Kes'),
copy: i18n.__('Kopyala'),
paste: i18n.__('Yapıştır'),
saveImage: i18n.__('Resmi Kaydet'),
saveImageAs: i18n.__('Resmi Farklı Kaydet'),
copyImage: i18n.__('Resmi Kopyala'),
copyImageAddress: i18n.__('Resim Adresini Kopyala'),
copyLink: i18n.__('Bağlantıyı Kopyala'),
saveLinkAs: i18n.__('Bağlantıyı Kaydet'),
inspect: i18n.__('İncele'),
//services: 'xxx'
},
showLookUpSelection: true,
showCopyImageAddress: true,
showSaveImageAs: true,
showInspectElement: false,
showSearchWithGoogle: false
});


var tabEl = document.createElement('div');
tabEl.classList.add('tab');
tabEl.innerHTML = `<img class="tab-icon" src="//:0">
<p class="tab-label">${ i18n.__('Yükleniyor...') }</p>
<img class="tab-close" src="images/close.svg">`.trim();

document.getElementById('new-tab').insertAdjacentElement('beforebegin', tabEl);

view.tab = {
element: document.getElementById('new-tab').previousElementSibling,
setIcon: async (icon) => {
/*view.tab.icon.addEventListener("error", () => { view.tab.icon.src = '//:0' });*/
if(icon && icon != 'null/favicon.ico') { view.tab.icon.src = icon; }
},
setTitle: async (title) => { view.tab.title.innerText = title; },
close: async () => { view.tab.element.remove(); }
};

view.tab.element.style.opacity = '1';
view.tab.element.style.width = '250px';

view.tab.icon = view.tab.element.children[0];
view.tab.title = view.tab.element.children[1];
view.tab.button = view.tab.element.children[2];

// TAB MENU
let tabMenuTemp = [
{ label: i18n.__('Yeniden Yükle'), click: async() => view.webContents.reload() },
{ label: i18n.__('Yenile'), click: async() => this.newView(view.webContents.getURL()) },
{ label: i18n.__('Sabitle'), click: async() => alert(i18n.__('Geliştirme aşamasında !')) },
{ type: 'separator' },
{ label: i18n.__('Kapat'), click: async() => this.close(view) }
];

view.tab.element.addEventListener('mousedown', async (e) => {
switch (e.which) {
case 1:
this.activate(view);
break;
case 2:
this.close(view);
break;
case 3:
Menu.buildFromTemplate(tabMenuTemp).popup();
break;
default:
break;
}
});

view.tab.button.addEventListener('click', async (e) => {
e.stopPropagation();
this.close(view);
});

view.type = 'tab';
view.webContents.loadURL(url);
this.initBrowserView(view);
this.viewAdded(view);
if(active) { this.activate(view); this.activate(view); }
return view;
}

// Navigate to the next tab relative to the active one:
exports.nextTab = async () => {
let length = this.tabs.length;
let index = this.tabs.indexOf(activeTab);

if (length == 1) return;

if (index == length - 1) { this.activate(this.tabs[0]); }
else { this.activate(this.tabs[index + 1]); }
}

// Navigate to the previous tab relative to the active one:
exports.backTab = async () => {
let length = this.tabs.length;
let index = this.tabs.indexOf(activeTab);

if (length == 1) return;

if (index == 0) { this.activate(this.tabs[length - 1]); }
else { this.activate(this.tabs[index - 1]); }
}

exports.viewActivated = function (view) { web.changeTab(view, storage); }
exports.viewAdded = function (view) { this.tabs.push(view); ipcRenderer.send('viewAdded'); }
exports.viewClosed = function (view, tabs=this.tabs) {
const index = tabs.indexOf(view);
if (index > -1) tabs.splice(index, 1);
}

exports.showDialog = async (text) => {
let { BrowserView } = remote;
let view = new BrowserView();
view.webContents.loadURL('data:,' + encodeURIComponent(text));
remote.getCurrentWindow().addBrowserView(view);
}

document.getElementById('new-tab').addEventListener('click', async () => this.newView('holla://yeni-sekme'));

remote.app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
console.log(certificate, error);
event.preventDefault();
callback(true);
});

this.initDownloads();