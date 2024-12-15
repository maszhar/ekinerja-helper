const fs = require('fs')
const path = require('path')

const sourceDir = path.join(__dirname, 'external/view/build')
const targetDir = path.join(__dirname, 'dist/external/view')

function copyFolder(src, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true })
    }

    const entries = fs.readdirSync(src, { withFileTypes: true })
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const targetPath = path.join(target, entry.name)
        if (entry.isDirectory()) {
            copyFolder(srcPath, targetPath)
        } else {
            fs.copyFileSync(srcPath, targetPath)
        }
    }
}

copyFolder(sourceDir, targetDir)