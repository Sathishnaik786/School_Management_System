
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';

const pdfPath = String.raw`c:\Users\sathi\OneDrive\Desktop\School_Management_System\docs\Examination_Module.pdf`;

async function readPdf() {
    try {
        console.log(`Reading PDF from: ${pdfPath}`);
        if (!fs.existsSync(pdfPath)) {
            console.error('File does not exist');
            return;
        }
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        console.log('--- PDF CONTENT START ---');
        console.log(data.text);
        console.log('--- PDF CONTENT END ---');
    } catch (error) {
        console.error('Error reading PDF:', error);
    }
}

readPdf();
