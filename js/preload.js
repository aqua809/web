// PACKAGES
const {	ipcRenderer, remote } = require('electron');

//Dil Bağlantısı
//Language Connection
var i18n = new(require('../translations/i18n'));

// ANTI-FINGERPRINTING
async function modifyDefault (defaultVar, name, value) {
if (Object.defineProperty) {
Object.defineProperty(defaultVar, name, {
get: () => { return value }
});
} else if (Object.prototype.__defineGetter__) {
defaultVar.__defineGetter__(name, () => { return value });
}
}

modifyDefault(document, 'referrer', '');
modifyDefault(navigator, 'doNotTrack', '1');
modifyDefault(navigator, 'deviceMemory', undefined);
modifyDefault(navigator, 'hardwareConcurrency', Math.round(Math.random()) == 0 ? 4 : 8);
modifyDefault(navigator, 'appCodeName', Math.round(Math.random()) == 0 ? 'Mozilla' : 'Holla');
modifyDefault(navigator, 'appName', Math.round(Math.random()) == 0 ? 'Netscape' : 'Holla');
modifyDefault(navigator, 'mimeTypes', Math.round(Math.random()) == 0 ? {} : navigator.mimeTypes);
modifyDefault(navigator, 'plugins', Math.round(Math.random()) == 0 ? {} : navigator.plugins);
modifyDefault(screen, 'colorDepth', Math.round(Math.random()) == 0 ? 24 : 32);
window.close = e => { ipcRenderer.send('closeCurrentTab', remote.getCurrentWebContents().id); };
navigator.getBattery = () => {};
if(navigator.mediaDevices) navigator.mediaDevices.enumerateDevices = ()=>{return new Promise((r)=>{r(undefined)})}

// DIALOG HANDLERS
global.alert = window.alert = (message) => {
let url = (window.location.href.startsWith('holla')) ? 'holla' : window.location.href;

ipcRenderer.send('alert', {
message: message,
type: 'alert',
url: url
});
}

global.confirm = window.confirm = (message) => {
let url = (window.location.href.startsWith('holla')) ? 'holla' : window.location.href;

return ipcRenderer.sendSync('alert', {
message: message,
type: 'confirm',
url: url
});
}

global.prompt = window.prompt = (message) => {
let url = (window.location.href.startsWith('holla')) ? 'holla' : window.location.href;

return ipcRenderer.sendSync('alert', {
message: message,
type: 'prompt',
url: url
});
}

// FULLSCREEN HANDLERS
let esc_pointer = event => { if (event.keyCode === 27) { document.exitPointerLock(); } };
let esc_fullscreen = event => { if (event.keyCode === 27) { document.exitFullscreen(); } };

let pointerlockchange = async (e) => {
if (document.pointerLockElement) {
alertNewPopups(i18n.__('Çıkmak İçin ESC Basın'),'fullScreenYaanis','col-fullscren-yaani',i18n.__('İmlecinizi göstermek için ESC ye basın'),3000);
document.addEventListener("keydown", esc_pointer);
} else {
document.removeEventListener("keydown", esc_pointer);
}
};
let fullscreenchange = async (e) => {
console.log('fullscreenchange');
if (document.fullscreenElement) {
alertNewPopups(i18n.__('Çıkmak İçin ESC Basın'),'fullScreenYaanis','col-fullscren-yaani',i18n.__('Tam ekrandan çıkmak için ESC tuşuna basın'),3000);
document.addEventListener("keydown", esc_fullscreen);
} else {
document.removeEventListener("keydown", esc_fullscreen);
}
}

document.addEventListener('pointerlockchange', pointerlockchange, false);

document.addEventListener('fullscreenchange', fullscreenchange);
document.addEventListener('webkitfullscreenchange', fullscreenchange);

// PDF Reader

// window.addEventListener('load', async e => {
// 	if(document.querySelectorAll('embed[type="application/pdf"]').length == 1) {
// 		document.body.innerHTML = `<iframe style="position: absolute; height: 100%; width: 100%; border: none;"
// 			src="https://holla.com.tr/pdf-viewer.html?file=${window.location.href}"></iframe>`;
// 	}
// });

// IPC FEATURES
if (window.location.protocol == 'holla:' || window.location.protocol == 'file:') {
ipcRenderer.once('setError', (event, details) => {
setError(details);
});

global.sendSync = ipcRenderer.sendSync;
global.send = ipcRenderer.send;
global.on = ipcRenderer.on;
global.ipcRenderer = ipcRenderer;
global.fs = require('fs');
global.dirname = __dirname;
global.i18n = i18n;
}

async function alertNewPopups(xtitle,xid,xclass,xmessage,xduration) {
var itemEl = document.createElement('div');
itemEl.title = xtitle;
itemEl.id = xid;
itemEl.className = xclass;
itemEl.innerHTML = `
<div class="full-card-yaani" style="font-family: verdana;position: fixed;top: 30px;margin: 0 auto;z-index: 999999999;left: 0;right: 0;width: 100%;text-align: center;max-width: 290px;padding: 10px 3px;background: rgb(0 0 0 / 47%);color: white;font-size: 12px;border-radius: 5px; ">
${xmessage}
</div>
`.trim();
document.body.appendChild(itemEl);
setTimeout(function(){ document.getElementById(xid).remove(); }, xduration);
}

/* Sayfa Yüklendi */
window.addEventListener('load', async e => {

/* Fare Sağ Ve Orta Tıklama - Yeni Pencere Açma _blank */
document.addEventListener('auxclick', async e => { 
if (e.button == 1) {
e.preventDefault();
var links = e.path;
for (items of links){
if(items.localName == 'a') {
console.log(items.href);
ipcRenderer.send('openPageNews', items.href);
}
}
//if (e.target.localName == 'a')
}
});

/* Yeni Pencere Açma a etiketinde _blank varsa */
[].forEach.call(document.getElementsByTagName("a"),function(el){ 
if (el.target == "_blank") { 
el.addEventListener("click",function(e){
e.preventDefault();  
//window.location.href = el.href;
ipcRenderer.send('openPageNews', el.href);
});
}

});


//Dil Çeviri Yap
var i18nTitle = document.getElementById("i18n");
if(i18nTitle){ i18nTitle.innerHTML = i18n.__(i18nTitle.innerHTML); }

[].forEach.call(document.getElementsByClassName("i18n"),function(el){ 
if(el.placeholder){ el.placeholder = i18n.__(el.placeholder); }
if(el.title){ el.title = i18n.__(el.title); }
});

[].forEach.call(document.getElementsByTagName("i18n"),function(el){ 
var keyslo = el.innerHTML;
el.innerHTML = i18n.__(keyslo);
el.style.display = 'block';
});


});