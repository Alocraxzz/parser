const fs = require('fs-extra');

const foldersToDelete = ['./scripts', './styles', './images', './fonts'];

foldersToDelete.forEach(folder => {
    try {
        fs.removeSync(folder);
        console.log(`Folder ${folder} successfully deleted.`);
    } catch (err) {
        console.error(`An error occurred while deleting folder ${folder}: ${err.message}`);
    }
});
