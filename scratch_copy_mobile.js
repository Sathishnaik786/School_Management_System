const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(source)) return;
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        if (file === 'node_modules' || file === '.expo') return;
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
['app', 'src', 'docs', 'scripts', 'tests'].forEach(dir => {
    copyFolderRecursiveSync(path.join(root, 'mobile-app', dir), path.join(root, 'apps', 'mobile', dir));
});

['package.json', 'tsconfig.json', 'app.json', 'babel.config.js', 'metro.config.js', 'tailwind.config.js', '.eslintrc.js', '.prettierrc', '.editorconfig', 'CodingStandards.md', 'FolderStructure.md', 'README.md', '.env', '.env.development', '.env.production', '.env.example', 'expo-env.d.ts', 'global.d.ts'].forEach(file => {
    const src = path.join(root, 'mobile-app', file);
    const dest = path.join(root, 'apps', 'mobile', file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    }
});

console.log('SUCCESS: mobile-app/ fully copied to apps/mobile/');
