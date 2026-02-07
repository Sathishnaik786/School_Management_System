
const fs = require('fs');

const pdfPath = 'c:\\Users\\sathi\\OneDrive\\Desktop\\School_Management_System\\docs\\Examination_Module.pdf';

console.log('Testing File Access...');
try {
    if (fs.existsSync(pdfPath)) {
        console.log('File Exists.');
        const stats = fs.statSync(pdfPath);
        console.log('Size:', stats.size);
        const buffer = fs.readFileSync(pdfPath);
        console.log('First 20 bytes hex:', buffer.subarray(0, 20).toString('hex'));
    } else {
        console.log('File NOT found.');
    }
} catch (e) {
    console.error('Error:', e);
}
console.log('Done.');
