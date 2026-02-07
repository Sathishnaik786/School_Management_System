
import * as fs from 'fs';
import * as path from 'path';
const pdf = require('pdf-parse');

const pdfPath = String.raw`c:\Users\sathi\OneDrive\Desktop\School_Management_System\docs\Examination_Module.pdf`;
const outputPath = path.join(__dirname, 'pdf_content.txt');

async function main() {
    try {
        console.log('Start');
        const buffer = fs.readFileSync(pdfPath);
        console.log('Read file, size:', buffer.length);
        const data = await pdf(buffer);
        console.log('Parsed text length:', data.text.length);
        fs.writeFileSync(outputPath, data.text);
        console.log('Success');
    } catch (e: any) {
        console.error('Error:', e);
        fs.writeFileSync(outputPath, 'ERROR: ' + e.message);
    }
}
main();
