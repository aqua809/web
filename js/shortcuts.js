const { Menu } = require('electron').remote;

var keyboardShortcut, switchTab;

exports.init = function (keyboardShortcutB, switchTabB) {
keyboardShortcut = keyboardShortcutB;
switchTab = switchTabB;
}

const menuTemplate = [
{
label: 'Window',
submenu: [
{
label: 'Geliştirme Araçlarını Aç',
accelerator: 'CmdOrCtrl+Alt+I',
click: async () => {
keyboardShortcut('browserDevTools');
}
},
{
label: 'Holla\'Yi Yeniden Başlatın',
accelerator: 'CmdOrCtrl+Alt+R',
click: async () => {
keyboardShortcut('restart');
}
},
{
label: 'Arama Çubuğuna Odaklan',
accelerator: 'CmdOrCtrl+E',
click: async () => {
keyboardShortcut('focusSearchbar');
}
},
{
label: 'Arama Çubuğuna Odaklan',
accelerator: 'CmdOrCtrl+L',
click: async () => {
keyboardShortcut('focusSearchbar');
}
},
{
label: 'Geçmişi Aç',
accelerator: 'CmdOrCtrl+H',
click: async () => keyboardShortcut('openHistory')
},
{
label: 'Yer imlerini Aç',
accelerator: 'CmdOrCtrl+B',
click: async () => keyboardShortcut('openBookmarks')
},
{
label: 'Ayarları Aç',
accelerator: 'CmdOrCtrl+Shift+S',
click: async () => keyboardShortcut('openSettings')
}
]
},
{
label: 'Web Site',
submenu: [
{
label: 'Geliştirme Araçlarını Aç',
accelerator: 'CmdOrCtrl+Shift+I',
click: async () => {
keyboardShortcut('devTools');
}
},
{
label: 'Yakınlaştır',
accelerator: 'CmdOrCtrl++',
click: async () => {
keyboardShortcut('zoomIn');
}
},
{
label: 'Uzaklaştır',
accelerator: 'CmdOrCtrl+-',
click: async () => {
keyboardShortcut('zoomOut');
}
},
{
label: 'Yakınlaştırmayı Sıfırla',
accelerator: 'CmdOrCtrl+0',
click: async () => {
keyboardShortcut('resetZoom');
}
},
{
label: 'Geri',
accelerator: 'Alt+Left',
click: async () => {
keyboardShortcut('backPage');
}
},
{
label: 'İleri',
accelerator: 'Alt+Right',
click: async () => {
keyboardShortcut('forwardPage');
}
},
{
label: 'Sayfayı Yeniden Yüklemek',
accelerator: 'F5',
click: async () => {
keyboardShortcut('refreshPage');
}
},
{
label: 'Sayfayı Yeniden Yüklemek',
accelerator: 'CmdOrCtrl+R',
click: async () => {
keyboardShortcut('refreshPage');
}
},
{
label: 'Sayfayı Yeniden Yüklemeye Zorla',
accelerator: 'CmdOrCtrl+F5',
click: async () => {
keyboardShortcut('forceReload');
}
},
{
label: 'Farklı kaydet...',
accelerator: 'CmdOrCtrl+S',
click: async () => {
keyboardShortcut('savePage');
}
},
{
label: 'Yukarı Kaydır',
accelerator: 'CmdOrCtrl+Up',
click: async () => {
keyboardShortcut('scrollToTop');
}
}
]
},
{
label: 'Sekmeler',
submenu: [
{
label: 'Sonraki Sekme',
accelerator: 'CmdOrCtrl+Tab',
click: async () => {
keyboardShortcut('nextTab');
}
},
{
label: 'Önceki Sekme',
accelerator: 'CmdOrCtrl+Shift+Tab',
click: async () => {
keyboardShortcut('backTab');
}
},
{
label: 'Yeni Sekme',
accelerator: 'CmdOrCtrl+T',
click: async () => {
keyboardShortcut('newTab');
}
},
{
label: 'Yeni Pencere',
accelerator: 'CmdOrCtrl+n',
click: async () => {
keyboardShortcut('newWindow');
}
},
{
label: 'Sekmeyi Kapat',
accelerator: 'CmdOrCtrl+W',
click: async () => {
keyboardShortcut('closeTab');
}
},
{
label: 'Kapalı Sekmeyi Aç',
accelerator: 'CmdOrCtrl+Shift+T',
click: async () => {
keyboardShortcut('openClosedTab');
}
},
{
label: 'Hızlı Anahtar',
submenu: [
{ label: 'Sekmeye git 1', accelerator: 'CmdOrCtrl+1', click: async () => switchTab(1) },
{ label: 'Sekmeye git 2', accelerator: 'CmdOrCtrl+2', click: async () => switchTab(2) },
{ label: 'Sekmeye git 3', accelerator: 'CmdOrCtrl+3', click: async () => switchTab(3) },
{ label: 'Sekmeye git 4', accelerator: 'CmdOrCtrl+4', click: async () => switchTab(4) },
{ label: 'Sekmeye git 5', accelerator: 'CmdOrCtrl+5', click: async () => switchTab(5) },
{ label: 'Sekmeye git 6', accelerator: 'CmdOrCtrl+6', click: async () => switchTab(6) },
{ label: 'Sekmeye git 7', accelerator: 'CmdOrCtrl+7', click: async () => switchTab(7) },
{ label: 'Sekmeye git 8', accelerator: 'CmdOrCtrl+8', click: async () => switchTab(8) },
{ label: 'Sekmeye git 9', accelerator: 'CmdOrCtrl+9', click: async () => switchTab(9) }
]
}
]
}
];

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
