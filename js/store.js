// PACKAGE LOADING

const Store = require('electron-store'); // Used for readable/writable storage
const { v1 } = require('uuid'); // Used to generate random IDs for each history item
const base64KeysTo = require('./base64.min.js');

// ENCRYPTION

// const keytar = require('keytar');
// var pass = v1();
// keytar.getPassword('holla', 'encryptionKey').then(r => {
//   console.log(r, pass);
//   if(!r) keytar.setPassword('holla', 'encryptionKey', pass);
//   else pass = r;
// });

// STORAGE FILE INIT

// Initialize the ElectronStore objects:
const history = new Store({ name: 'history' });
const bookmarks = new Store({ name: 'bookmarks' });
const downloads = new Store({ name: 'downloads' });

// Create history.json and bookmarks.json:
history.set('app', 'holla');
bookmarks.set('app', 'holla');
downloads.set('app', 'holla');

history.delete('app');
bookmarks.delete('app');
downloads.delete('app');

// Globalize history for debugging:
window.hist = history;

// FUNCTIONS

// Manage history:
exports.getHistory = async () => history.get(); // Returns all contents of history.json

exports.removeHistoryItem = async (id) => history.delete(id);

exports.clearHistory = async () => history.clear();

exports.logHistory = async function (site, title) {
let id = v1(); let idBase64 = base64KeysTo.encode(site);
let item = { "id": id, "idBase64": idBase64, "url": site, "title": title, "time": + new Date() };
return history.set(id, item);
}

// Manage bookmarks:
exports.getBookmarks = async () => bookmarks.get(); // Returns all contents of bookmarks.json

exports.removeBookmark = async id => bookmarks.delete(id);

exports.clearBookmark = async () => bookmarks.clear();

exports.addBookmark = async function (site, title) {
let idBase64 = v1();
let id = base64KeysTo.encode(site);
let item = { "id": id, "idBase64": idBase64, "url": site, "title": title, "time": + new Date() };
return bookmarks.set(id, item);
}

exports.isBookmarked = async function (url) {
try {
let id = base64KeysTo.encode(url);
let bookmarks2 = bookmarks.get(id);
var exists = false;
if(bookmarks2.url == url){ exists = id;}
return exists;
} catch (error) {
return false;
}
}

exports.renameBookmark = async function (id, name) {
let bookmark = history.get(id);
bookmark.title = name;
history.set(id, bookmark);
}

// Manage downloads:
exports.getDownloads = async () => downloads.get(); // Returns all contents of downloads.json

exports.removeDownloads = async id => downloads.delete(id);

exports.clearDownloads = async () => downloads.clear();

exports.addDownloads = async function (id, Filename, Address, url, getTotalBytes, getMimeType, status) {
let idBase64 = base64KeysTo.encode(Filename);
let item = { "id": id, "idBase64": idBase64, "url": Address, "urlreal": url, "title": Filename, "getTotalBytes": getTotalBytes, "getMimeType": getMimeType, "status": status, "time": + new Date() };
return downloads.set(id, item);
}

exports.SavePathDownloads = async function (id, name) {
let bookmark = downloads.get(id);
bookmark.url = name;
downloads.set(id, bookmark);
}

exports.StatusDownloads = async function (id, name) {
let bookmark = downloads.get(id);
bookmark.status = name;
downloads.set(id, bookmark);
}