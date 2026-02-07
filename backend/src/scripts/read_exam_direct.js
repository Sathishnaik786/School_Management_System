
const fs = require('fs');
const path = require('path');

// Try direct path to CJS entry point
const pdfPathToLib = path.resolve(__dirname, '../../node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs');
console.log('Requiring lib from:', pdfPathToLib);
const pdfLib = require(pdfPathToLib);

const pdfPath = 'c:\\Users\\sathi\\OneDrive\\Desktop\\School_Management_System\\docs\\Examination_Module.pdf';
const outputPath = path.join(__dirname, 'pdf_content.txt');

async function main() {
    try {
        console.log('Type of lib:', typeof pdfLib);
        console.log('Keys:', Object.keys(pdfLib));

        // It seems based on previous logs, the object has "default" which might be the function?
        // OR "default" has "default"?

        let pdfFunc = pdfLib;
        if (typeof pdfFunc !== 'function') {
            if (pdfFunc.default) {
                console.log('Using .default');
                pdfFunc = pdfFunc.default;
            }
            // Double default?
            if (typeof pdfFunc !== 'function' && pdfFunc.default) {
                console.log('Using .default.default');
                pdfFunc = pdfFunc.default;
            }
        }

        if (typeof pdfFunc !== 'function') {
            throw new Error('Still not a function!');
        }

        const buffer = fs.readFileSync(pdfPath);
        const data = await pdfFunc(buffer);
        console.log('Text length:', data.text.length);
        fs.writeFileSync(outputPath, data.text);
        console.log('Done.');

    } catch (e) {
        console.error(e);
        fs.writeFileSync(outputPath, 'ERROR: ' + e.message);
    }
}
main();
