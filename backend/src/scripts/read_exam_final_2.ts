
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

const pdfPath = String.raw`c:\Users\sathi\OneDrive\Desktop\School_Management_System\docs\Examination_Module.pdf`;
const outputPath = path.join(__dirname, 'pdf_content.txt');

async function main() {
    try {
        console.log('Start');
        const buffer = fs.readFileSync(pdfPath);

        console.log('pdf import type:', typeof pdf);
        if (typeof pdf !== 'function') {
            console.log('pdf import keys:', Object.keys(pdf));
        }

        let data;
        if (typeof pdf === 'function') {
            data = await pdf(buffer);
        } else if ((pdf as any).default && typeof (pdf as any).default === 'function') {
            data = await (pdf as any).default(buffer);
        } else {
            throw new Error('No pdf function found on import');
        }

        console.log('Parsed text length:', data.text.length);
        fs.writeFileSync(outputPath, data.text);
        console.log('Success');
    } catch (e: any) {
        console.error('Error:', e);
        fs.writeFileSync(outputPath, 'ERROR: ' + e.message);
    }
}
main();
