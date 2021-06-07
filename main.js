const { app, BrowserWindow, dialog, ipcMain } = require('electron');

const isDevMode = require('electron-is-dev');
const { format } = require('url');
const { join } = require('path');
const os = require('os');

//STORAGE - DEPOLAMA
const Store = require('electron-store');
let store = new Store();

let mainWindow;

process.noDeprecation = true;

//Google Ayarları
// Google Settings -> https://console.cloud.google.com/
process.env.GOOGLE_API_KEY = 'AIzaSyBArCL81W8enc16MMuYy4Sj-xfZFNKyYSo';
process.env.GOOGLE_DEFAULT_CLIENT_ID = '590185167148-f09884kcvf5p736tcv9ahjtepttbttk6.apps.googleusercontent.com'
process.env.GOOGLE_DEFAULT_CLIENT_SECRET = 'MuenKtdB49ve9GKnEea8hpbA'

//Flash Sistemi Kullanımdan Kaldırıldı
//Flash System Deprecated -> https://www.blog.google/products/chrome/saying-goodbye-flash-chrome/

//Bu kitaplığı kendiniz manuel olarak ekleyebilirsiniz
//You can manually add this library yourself
app.commandLine.appendSwitch('ppapi-flash-path', os.homedir()+'/AppData/Local/Google/Chrome/User Data/PepperFlash/32.0.0.453/pepflashplayer.dll');
// Specify flash version, for example, v32.0.0.453
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.453');

app.disableHardwareAcceleration();

//Yeni Pencere Aç - Open New Window 
ipcMain.on('newWindowsOpens', () => {
createWindow();
});

async function createWindow() {
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
process.env['ELECTRON_ENABLE_LOGGING'] = true;

mainWindow = new BrowserWindow({
title: 'Holla',
frame: false,
minWidth: 500,
minHeight: 450,
backgroundColor: '#FFFFFF',
webPreferences: {
contextIsolation: false ,
nodeIntegration: true,
enableRemoteModule: true,
backgroundThrottling: false,
nativeWindowOpen: false,
nodeIntegrationInSubFrames: false
},
width: 1280,
height: 720,
icon: join(__dirname, '/images/Icon-256x256.png'),
transparent: false
});

if (isDevMode) {
mainWindow.openDevTools({ mode: 'detach' });
}
mainWindow.loadURL(format({
pathname: join(__dirname, 'browser.html'),
protocol: 'file:',
slashes: true
}));

mainWindow.maximize();
mainWindow.webContents.on('crashed', async (e) => console.log('crashed', e));

//Pencere kapatıldığında yayınlanır.
//Emitted when the window is closed.
mainWindow.on('closed', async () => {
mainWindow = null;
});

mainWindow.webContents.on('new-window', function(e, url) {
e.preventDefault();
});

createUpdater();
}

async function createUpdater() {
const { autoUpdater } = require("electron-updater");

//Bir güncelleme bulunduğunda otomatik olarak indirilip indirilemeyeceği.
//Whether an update can be downloaded automatically when it is found.
autoUpdater.autoDownload = false;
//İndirilen bir güncellemenin uygulamadan çıkıldığında otomatik olarak yüklenip yüklenmeyeceği ( quitAndInstalldaha önce çağrılmadıysa).
//Whether a downloaded update will be installed automatically upon exiting the application (if quitAndInstall was not called before).
autoUpdater.autoInstallOnAppQuit = false;
//Otomatik alpha beta testleri al indir özelliği
//Get automatic alpha beta tests download feature
autoUpdater.allowPrerelease = false;

mainWindow.once('ready-to-show', () => {
//Sunucuya güncelleme olup olmadığını sorar. Bildirim göndermez
//It asks the server if there is an update. Does not send notification
autoUpdater.checkForUpdates();
//Sunucuya bir güncelleme olup olmadığını sorar, indirme ve güncelleme varsa masaüstü bildirir.
//It asks the server if an update is available, and the desktop reports if there is a download or update.
//autoUpdater.checkForUpdatesAndNotify();
});

//Güncellemeleri kontrol etmek
//Checking for updates
autoUpdater.on("checking-for-update", () => {
//Güncellemeler Kontrol Ediliyor !! Komutlar Buraya
//Checking for Updates !! Commands Here
});

//Güncelleme yok
//No updates available
autoUpdater.on("update-not-available", info => {
//Yeni Güncelleme Bulunamadı !! Komutlar Buraya
//No New Update Found !! Commands Here
});

//Yeni güncelleme mevcut
//New Update Available
autoUpdater.on("update-available", info => {
if(info){ store.set('stroe_au_releaseInfo', info); }
mainWindow.webContents.send('update_available'); 
});

//Durum Raporunu İndir
//Download Status Report
autoUpdater.on("download-progress", progressObj => {
//Yeni Güncelleme Şu anda indiriliyor !!
//New Update is currently downloading !!
});

//İndirme Tamamlandı Mesajı
//Download Completion Message
autoUpdater.on("update-downloaded", info => {
//Artık yeni bir sürüm mevcut. Yeni sürüm indirildi.
//A new version is now available. I downloaded a new version.
store.set('stroe_au_app_download', false);
store.set('stroe_update_downloaded', true);
});

//İndirilmiş Olan Güncellemeyi Yüklemesini Başlat
//Start the Downloaded Update Installation
ipcMain.on('au_app_install_reset', () => {
store.delete('stroe_au_releaseInfo');
store.delete('stroe_au_app_download');
store.delete('stroe_update_downloaded');
setTimeout(function(){ autoUpdater.quitAndInstall(); }, 250);
});

//Güncellemeyi İndirmeye Başlat
//Start Downloading Update
ipcMain.on('au_app_download', () => {
store.set('stroe_au_app_download', true);
autoUpdater.downloadUpdate();
});
}

//Uygulamaya Başlarken
//Getting Started
app.on('ready', async () => { 
//Otomatik Dil Ayarlar
// Auto Lang Select
if (!store.get('settings.langs')) {
store.set('settings.langs', app.getLocale());
}
store.set('tabslengthOnlys', 0);
store.set('loadEnableAdBlockings', false);
store.set('setDowloandLoads', false);
if(!store.get('appGetPath')){ store.set('appGetPath', app.getPath('downloads')); }
createWindow();
});

//Tüm pencereler kapatıldığında çıkın.
//Quit when all windows are closed.
app.on('window-all-closed', async () => {
// On OS X it is common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q
if (process.platform !== 'darwin') {
if (mainWindow) {
mainWindow.webContents.closeDevTools();
}
app.quit();
}
});

//Uygulama Hatası, Kilitlendi
//Application Error, Crashed
app.on('renderer-process-crashed', async () => {
console.log('rp-crashed');
});

app.on('activate', async () => {
// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
if (mainWindow === null) createWindow();
});