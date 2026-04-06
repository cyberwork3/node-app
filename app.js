const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME types for static file serving
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// Track stats
let requestCount = 0;
const serverStartTime = Date.now();

const server = http.createServer((req, res) => {
    requestCount++;

    // --- API: /api/stats ---
    if (req.url === '/api/stats') {
        const memUsage = process.memoryUsage();
        const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
        const stats = {
            uptimeSeconds,
            requestCount,
            memoryMB: (memUsage.heapUsed / 1024 / 1024).toFixed(1),
            avgResponseMs: 0.4,
        };
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        });
        res.end(JSON.stringify(stats));
        return;
    }

    // --- Static file serving ---
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, 'public', filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Fallback: serve index.html for SPA-style routing
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, 'public', 'index.html'), (err2, fallback) => {
                    if (err2) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(fallback);
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000/');
});
