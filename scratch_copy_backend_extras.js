const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(source)) return;
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        const curSource = path.join(source, file);
        const curTarget = path.join(target, file);
        if (fs.lstatSync(curSource).isDirectory()) {
            copyFolderRecursiveSync(curSource, curTarget);
        } else {
            fs.copyFileSync(curSource, curTarget);
        }
    });
}

const root = __dirname;
copyFolderRecursiveSync(path.join(root, 'backend', 'scripts'), path.join(root, 'apps', 'api', 'scripts'));
copyFolderRecursiveSync(path.join(root, 'backend', 'database'), path.join(root, 'apps', 'api', 'database'));
copyFolderRecursiveSync(path.join(root, 'backend', 'reports'), path.join(root, 'apps', 'api', 'reports'));

['.env', '.env.local'].forEach(file => {
    const src = path.join(root, 'backend', file);
    const dest = path.join(root, 'apps', 'api', file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
});

console.log('SUCCESS: backend/scripts, backend/database, backend/reports, and .env copied to apps/api/');
