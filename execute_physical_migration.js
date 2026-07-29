const fs = require('fs');
const path = require('path');

const root = __dirname;

function moveDir(src, dest) {
    const srcPath = path.join(root, src);
    const destPath = path.join(root, dest);

    if (!fs.existsSync(srcPath)) {
        console.log(`Source does not exist, skipping: ${src}`);
        return;
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(destPath);
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }

    console.log(`Moving ${src} -> ${dest}`);
    fs.renameSync(srcPath, destPath);
}

try {
    // 1. Backup existing apps placeholders
    moveDir('apps/api', 'apps/api_placeholder');
    moveDir('apps/web', 'apps/web_placeholder');
    moveDir('apps/mobile', 'apps/mobile_placeholder');

    // 2. Move original applications into target apps/ layout
    moveDir('backend', 'apps/api');
    moveDir('frontend', 'apps/web');
    moveDir('mobile-app', 'apps/mobile');

    console.log('SUCCESS: Physical application move completed.');
} catch (err) {
    console.error('ERROR during physical move:', err);
}
