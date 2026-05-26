const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

app.use(express.json({ limit: '10mb' }));

// 确保数据文件存在
function ensureDataFile() {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ bookings: [], deviceBindings: {} }, null, 2));
    }
}

// GET /api/data - 读取所有数据（兼容原 JSONBin record 格式）
app.get('/api/data', (req, res) => {
    try {
        ensureDataFile();
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json({ record: data });
    } catch (err) {
        res.status(500).json({ error: '读取数据失败', detail: err.message });
    }
});

// PUT /api/data - 写入所有数据
app.put('/api/data', (req, res) => {
    try {
        ensureDataFile();
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: '保存数据失败', detail: err.message });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 提供前端静态文件（放在 API 路由之后，避免拦截 /api/*）
app.use(express.static(__dirname));

// SPA fallback（直接访问 HTML 文件时不需要此项，保留以兼容）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`车辆预定系统已启动：http://localhost:${PORT}`);
});
