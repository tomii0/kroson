const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './krosonai.html';

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 - File Not Found: ' + filePath);
            } else {
                res.writeHead(500);
                res.end('500 - Server Error');
            }
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       KRONOS AI - LOCAL SERVER       ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  Running at: http://localhost:${PORT}    ║`);
    console.log('║                                      ║');
    console.log('║  Google Auth now works on localhost! ║');
    console.log('║  Press Ctrl+C to stop the server.   ║');
    console.log('╚══════════════════════════════════════╝\n');
});
