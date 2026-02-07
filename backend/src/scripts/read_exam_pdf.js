
const pdfLib = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfPath = 'c:\\Users\\sathi\\OneDrive\\Desktop\\School_Management_System\\docs\\Examination_Module.pdf';
const outputPath = path.join(__dirname, 'pdf_content.txt');

async function readPdf() {
    try {
        let pdfFunc = null;

        if (typeof pdfLib === 'function') {
            console.log('Using pdfLib directly');
            pdfFunc = pdfLib;
        } else if (pdfLib.PDFParse && typeof pdfLib.PDFParse === 'function') {
            console.log('Using pdfLib.PDFParse');
            pdfFunc = pdfLib.PDFParse;
        } else if (pdfLib.default && typeof pdfLib.default === 'function') {
            console.log('Using pdfLib.default');
            pdfFunc = pdfLib.default;
        } else {
            console.log('Could not find function. Keys:', Object.keys(pdfLib));
            // Just try the default implementation style in older versions
            // require('pdf-parse')(buffer)
        }

        if (!pdfFunc) throw new Error("No PDF function found");

        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfFunc(dataBuffer);

        console.log(`Writing ${data.text.length} chars to ${outputPath}`);
        fs.writeFileSync(outputPath, data.text);
        console.log('Done writing.');
    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync(outputPath, 'ERROR: ' + error.message);
    }
}

readPdf();
