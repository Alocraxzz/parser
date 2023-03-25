const { app, BrowserWindow, Menu } = require('electron');
const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

const baseUrl = `https://russianwarship.rip`;

const mkdirIfNotExistsSync = (path) => {
    try {
        fs.statSync(path);
    } catch (error) {
        if (error.code === 'ENOENT') {
            fs.mkdirSync(path);
        } else {
            throw error;
        }
    }
};

let win;

function createWindow () {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
        }
    });

    win.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    axios.get(`${baseUrl}`)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            mkdirIfNotExistsSync('./styles');

            $('link[rel="stylesheet"]').each(function() {
                const href = $(this).attr('href');
                const fileName = href.split('/').pop();

                https.get(`${baseUrl}${href}`, (res) => {
                    const filePath = `./styles/${fileName}`;
                    const fileStream = fs.createWriteStream(filePath);
                    res.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`Saved file ${fileName}`);
                        $(this).attr('href', filePath);
                        fs.writeFile('index.html', $.html(), err => {
                            if (err) throw err;
                            console.log('Styles saved!');
                        });
                    });
                });
            });

            mkdirIfNotExistsSync('./images');

            $('img').each(function() {
                const src = $(this).attr('src');
                const fileName = src.split('/').pop();

                https.get(`${src}`, (res) => {
                    const filePath = `./images/${fileName}`;
                    const fileStream = fs.createWriteStream(filePath);
                    res.pipe(fileStream);

                    $(this).attr('src', filePath);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`Saved file ${fileName}`);
                    });
                });
            });

            const urls = [
                {url: `${baseUrl}/images/bg.png`, filename: `bg.png`},
                {url: `${baseUrl}/images/bg-yellow.svg`, filename: `bg-yellow.svg`},
                {url: `${baseUrl}/images/bg-blue.svg`, filename: `bg-blue.svg`},
                {url: `${baseUrl}/images/warship.svg`, filename: `warship.svg`},
                {url: `${baseUrl}/images/tooltip-bg.svg`, filename: `tooltip-bg.svg`},
            ];

            urls.forEach((elem, index) => {
                https.get(elem.url, (res) => {
                    const filePath = `./images/${elem.filename}`;
                    const fileStream = fs.createWriteStream(filePath);
                    res.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`Saved file ${elem.filename}`);
                    });
                });
            });

            mkdirIfNotExistsSync('./scripts');

            $('script[src]').each(function() {
                const src = $(this).attr('src');
                const fileName = src.split('/').pop();

                https.get(`${baseUrl}${src}`, (res) => {
                    const filePath = `./scripts/${fileName}`;
                    const fileStream = fs.createWriteStream(filePath);
                    res.pipe(fileStream);

                    $(this).attr('src', filePath);
                    
                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`Saved file ${fileName}`);
                    });
                });
            });

            mkdirIfNotExistsSync('./fonts');

            $('link[rel="preload"]').each(function() {
                const href = $(this).attr('href');
                const fileName = href.split('/').pop();

                https.get(`${href}`, (res) => {
                    const filePath = `./fonts/${fileName}`;
                    const fileStream = fs.createWriteStream(filePath);
                    res.pipe(fileStream);
                    
                    $(this).attr('href', filePath);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`Saved file ${fileName}`);
                    });
                });
            });

            fs.writeFile('index.html', $.html(), err => {
                if (err) throw err;
                console.log('HTML saved!');
            });
        })
        .catch(error => {
            console.log(error);
        });

    setTimeout(() => {
        win.loadFile('index.html');
    }, 1500);
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
