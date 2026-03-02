const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 飞书API配置
const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';
let tenantAccessToken = null;
let tokenExpireTime = 0;

// 获取tenant_access_token
async function getTenantAccessToken() {
    const now = Date.now();

    // 如果token还未过期，直接返回
    if (tenantAccessToken && now < tokenExpireTime) {
        return tenantAccessToken;
    }

    try {
        const response = await axios.post(
            `${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`,
            {
                app_id: process.env.FEISHU_APP_ID,
                app_secret: process.env.FEISHU_APP_SECRET
            }
        );

        if (response.data.code === 0) {
            tenantAccessToken = response.data.tenant_access_token;
            // 提前5分钟刷新token
            tokenExpireTime = now + (response.data.expire - 300) * 1000;
            return tenantAccessToken;
        } else {
            throw new Error(`获取token失败: ${response.data.msg}`);
        }
    } catch (error) {
        console.error('获取tenant_access_token失败:', error.message);
        throw error;
    }
}

// 通用飞书API调用函数
async function callFeishuAPI(method, path, data = null) {
    const token = await getTenantAccessToken();
    const url = `${FEISHU_API_BASE}${path}`;

    const config = {
        method,
        url,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        if (method === 'GET') {
            config.params = data;
        } else {
            config.data = data;
        }
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('飞书API调用失败:', error.response?.data || error.message);
        throw error;
    }
}

// ========== 车辆管理接口 ==========

// 获取所有车辆
app.get('/api/vehicles', async (req, res) => {
    try {
        const result = await callFeishuAPI(
            'POST',
            `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_VEHICLES_TABLE_ID}/records/search`,
            {
                page_size: 500
            }
        );

        if (result.code === 0) {
            res.json({
                success: true,
                data: result.data.items
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取车辆列表失败',
            error: error.message
        });
    }
});

// 获取单个车辆
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const result = await callFeishuAPI(
            'GET',
            `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_VEHICLES_TABLE_ID}/records/${req.params.id}`
        );

        if (result.code === 0) {
            res.json({
                success: true,
                data: result.data.record
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取车辆信息失败',
            error: error.message
        });
    }
});

// 更新车辆信息
app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const result = await callFeishuAPI(
            'PUT',
            `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_VEHICLES_TABLE_ID}/records/${req.params.id}`,
            {
                fields: req.body
            }
        );

        if (result.code === 0) {
            res.json({
                success: true,
                data: result.data.record
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新车辆信息失败',
            error: error.message
        });
    }
});

// ========== 预定管理接口 ==========

// 获取所有预定
app.get('/api/bookings', async (req, res) => {
    try {
        const result = await callFeishuAPI(
            'POST',
            `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_BOOKINGS_TABLE_ID}/records/search`,
            {
                page_size: 500
            }
        );

        if (result.code === 0) {
            res.json({
                success: true,
                data: result.data.items
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取预定列表失败',
            error: error.message
        });
    }
});

// 创建预定
app.post('/api/bookings', async (req, res) => {
    try {
        const result = await callFeishuAPI(
            'POST',
            `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_BOOKINGS_TABLE_ID}/records`,
            {
                fields: req.body
            }
        );

        if (result.code === 0) {
            res.json({
                success: true,
                data: result.data.record
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建预定失败',
            error: error.message
        });
    }
});

// 删除预定
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const result = await callFeishuAPI(
            'DELETE',
            `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_BOOKINGS_TABLE_ID}/records/${req.params.id}`
        );

        if (result.code === 0) {
            res.json({
                success: true
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.msg
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除预定失败',
            error: error.message
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
});
