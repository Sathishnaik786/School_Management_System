const fs = require('fs');
const path = require('path');

const root = __dirname;

function safeRename(oldPath, newPath) {
    const fullOld = path.join(root, oldPath);
    const fullNew = path.join(root, newPath);
    if (fs.existsSync(fullOld)) {
        console.log(`Renaming: ${oldPath} -> ${newPath}`);
        fs.renameSync(fullOld, fullNew);
    } else {
        console.log(`Path does not exist, skipping: ${oldPath}`);
    }
}

try {
    // Step 1: Backup existing apps placeholders
    safeRename('apps/api', 'apps/api_placeholder');
    safeRename('apps/web', 'apps/web_placeholder');
    safeRename('apps/mobile', 'apps/mobile_placeholder');

    // Step 2: Move original applications into apps/
    safeRename('backend', 'apps/api');
    safeRename('frontend', 'apps/web');
    safeRename('mobile-app', 'apps/mobile');

    console.log('SUCCESS: Migration steps 1 & 2 completed successfully.');
} catch (err) {
    console.error('ERROR during migration:', err);
}
