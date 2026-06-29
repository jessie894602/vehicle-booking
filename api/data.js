const https = require('https');

const JSONBIN_API_KEY = '$2a$10$0.el1vGg3USJgC1Gtui4k.FbLS9R6XHKyqM6n7YS9HjQgm2trFXW.';
const JSONBIN_BIN_ID = '699fd213d0ea881f40da7ef2';
const JSONBIN_BASE = 'api.jsonbin.io';

function jsonbinRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: JSONBIN_BASE,
            path,
            method,
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json',
            }
        };
        const req = https.request(options, (r) => {
            let data = '';
            r.on('data', chunk => data += chunk);
            r.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('响应解析失败: ' + data)); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const data = await jsonbinRequest('GET', `/v3/b/${JSONBIN_BIN_ID}/latest`);
            res.json({ record: data.record });
        } catch (err) {
            res.status(500).json({ error: '读取数据失败', detail: err.message });
        }
    } else if (req.method === 'PUT') {
        try {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const parsed = JSON.parse(body);
                    await jsonbinRequest('PUT', `/v3/b/${JSONBIN_BIN_ID}`, parsed);
                    res.json({ success: true });
                } catch (err) {
                    res.status(500).json({ error: '保存数据失败', detail: err.message });
                }
            });
        } catch (err) {
            res.status(500).json({ error: '保存数据失败', detail: err.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
