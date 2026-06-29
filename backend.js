// v3 - 代理 JSONBin，数据持久化
const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;
const JSONBIN_API_KEY = '$2a$10$0.el1vGg3USJgC1Gtui4k.FbLS9R6XHKyqM6n7YS9HjQgm2trFXW.';
const JSONBIN_BIN_ID = '699fd213d0ea881f40da7ef2';
const JSONBIN_BASE = 'api.jsonbin.io';

app.use(express.json({ limit: '10mb' }));

// 允许跨域（前端静态站点访问此后端）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// 请求 JSONBin 的通用函数
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

// GET /api/data - 从 JSONBin 读取数据
app.get('/api/data', async (req, res) => {
    try {
        const data = await jsonbinRequest('GET', `/v3/b/${JSONBIN_BIN_ID}/latest`);
        res.json({ record: data.record });
    } catch (err) {
        res.status(500).json({ error: '读取数据失败', detail: err.message });
    }
});

// PUT /api/data - 写入数据到 JSONBin
app.put('/api/data', async (req, res) => {
    try {
        await jsonbinRequest('PUT', `/v3/b/${JSONBIN_BIN_ID}`, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: '保存数据失败', detail: err.message });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 提供前端静态文件
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(require('path').join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`车辆预定系统已启动：http://localhost:${PORT}`);
});
