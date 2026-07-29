const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(source)) return;
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        if (file === 'node_modules') return;
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
copyFolderRecursiveSync(path.join(root, 'frontend', 'src'), path.join(root, 'apps', 'web', 'src'));
copyFolderRecursiveSync(path.join(root, 'frontend', 'public'), path.join(root, 'apps', 'web', 'public'));

['package.json', 'tsconfig.json', 'tsconfig.node.json', 'vite.config.ts', 'tailwind.config.ts', 'postcss.config.js', 'index.html', '.env'].forEach(file => {
    const src = path.join(root, 'frontend', file);
    const dest = path.join(root, 'apps', 'web', file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
});

console.log('SUCCESS: frontend/ fully copied to apps/web/');
