
const http = require('http');
const fs = require('fs');
const path = require('path');

const ports = [3000];
const endpoint = '/api/public-debug-pdf';
const outFile = path.join(__dirname, 'pdf_content_fetched.txt');

function tryPort(index) {
    if (index >= ports.length) return;
    const port = ports[index];
    console.log(`Trying port ${port}...`);

    const req = http.get(`http://localhost:${port}${endpoint}`, (res) => {
        console.log(`Response from ${port}: ${res.statusCode}`);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Body: ${data}`);
            fs.writeFileSync(outFile, data);
        });
    });

    req.on('error', (e) => {
        console.log(`Port ${port} error: ${e.message}`);
    });
}

tryPort(0);
