const { app, BrowserWindow, Menu } = require('electron');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline';"
        }
    });

    win.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    axios.get('https://russianwarship.rip/en')
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            // Загружаем стили страницы через HTTP-запрос
            axios.get('https://russianwarship.rip/dist/app.d5547f60550a7abd7256.css')
                .then(response => {
                    $('head').append(`<style>${response.data}</style>`);
                    // сохраняем HTML-код страницы
                    fs.writeFile('index.html', $.html(), err => {
                        if (err) throw err;
                        console.log('HTML saved!');
                    });
                    win.loadFile('index.html');
                })
                .catch(error => {
                    console.log(error);
                });
        })
        .catch(error => {
            console.log(error);
        });


}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
