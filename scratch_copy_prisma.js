const fs = require('fs');
const path = require('path');

const srcPrisma = path.join(__dirname, 'backend', 'prisma', 'schema.prisma');
const destDir = path.join(__dirname, 'apps', 'api', 'prisma');
const destPrisma = path.join(destDir, 'schema.prisma');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcPrisma)) {
    fs.copyFileSync(srcPrisma, destPrisma);
    console.log(`Copied schema.prisma to ${destPrisma} (${fs.statSync(destPrisma).size} bytes)`);
} else {
    console.error(`Source schema.prisma not found at ${srcPrisma}`);
}
