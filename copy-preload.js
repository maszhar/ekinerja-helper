const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src/preload.js');
const destPath = path.join(__dirname, 'build/preload.js');

fs.copyFile(srcPath, destPath, (err) => {
    if (err) {
        console.error('Error copying file:', err);
    } else {
        console.log('File copied successfully.');
    }
});