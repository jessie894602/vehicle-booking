// 飞书服务端 - 提供JSAPI签名和用户信息获取
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = 3000;

// ========== 配置 ==========
// 请在飞书开放平台创建应用后，填入以下信息
// https://open.feishu.cn/
const FEISHU_CONFIG = {
    APP_ID: 'cli_your_app_id_here',          // 替换为你的App ID
    APP_SECRET: 'your_app_secret_here',       // 替换为你的App Secret
};

// 缓存access_token和ticket，避免频繁请求
let tokenCache = {
    accessToken: null,
    accessTokenExpire: 0,
    jsapiTicket: null,
    jsapiTicketExpire: 0
};

// ========== 中间件 ==========
app.use(cors());
app.use(express.json());

// ========== 工具函数 ==========

// 获取tenant_access_token
async function getTenantAccessToken() {
    const now = Date.now();

    // 如果缓存有效，直接返回
    if (tokenCache.accessToken && tokenCache.accessTokenExpire > now) {
        return tokenCache.accessToken;
    }

    try {
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
            {
                app_id: FEISHU_CONFIG.APP_ID,
                app_secret: FEISHU_CONFIG.APP_SECRET
            }
        );

        if (response.data.code === 0) {
            tokenCache.accessToken = response.data.tenant_access_token;
            // 提前5分钟过期，避免边界情况
            tokenCache.accessTokenExpire = now + (response.data.expire - 300) * 1000;
            return tokenCache.accessToken;
        } else {
            throw new Error(`获取access_token失败: ${response.data.msg}`);
        }
    } catch (error) {
        console.error('获取tenant_access_token失败:', error);
        throw error;
    }
}

// 获取jsapi_ticket
async function getJsapiTicket() {
    const now = Date.now();

    // 如果缓存有效，直接返回
    if (tokenCache.jsapiTicket && tokenCache.jsapiTicketExpire > now) {
        return tokenCache.jsapiTicket;
    }

    try {
        const accessToken = await getTenantAccessToken();
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/jssdk/ticket/get',
            {},
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (response.data.code === 0) {
            tokenCache.jsapiTicket = response.data.data.ticket;
            // 提前5分钟过期
            tokenCache.jsapiTicketExpire = now + (response.data.data.expire_in - 300) * 1000;
            return tokenCache.jsapiTicket;
        } else {
            throw new Error(`获取jsapi_ticket失败: ${response.data.msg}`);
        }
    } catch (error) {
        console.error('获取jsapi_ticket失败:', error);
        throw error;
    }
}

// 生成随机字符串
function generateNonceStr(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 生成JSAPI签名
function generateSignature(ticket, nonceStr, timestamp, url) {
    const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    return crypto.createHash('sha1').update(str).digest('hex');
}

// ========== API路由 ==========

// 获取JSAPI配置（供前端调用）
app.get('/api/feishu/jsapi-config', async (req, res) => {
    try {
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({
                code: 400,
                message: 'URL参数不能为空'
            });
        }

        const ticket = await getJsapiTicket();
        const nonceStr = generateNonceStr();
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateSignature(ticket, nonceStr, timestamp, url);

        res.json({
            code: 0,
            data: {
                appId: FEISHU_CONFIG.APP_ID,
                timestamp,
                nonceStr,
                signature
            }
        });
    } catch (error) {
        console.error('生成JSAPI配置失败:', error);
        res.status(500).json({
            code: 500,
            message: '生成JSAPI配置失败',
            error: error.message
        });
    }
});

// 获取用户信息（通过user_access_token）
app.post('/api/feishu/user-info', async (req, res) => {
    try {
        const { userAccessToken } = req.body;

        if (!userAccessToken) {
            return res.status(400).json({
                code: 400,
                message: 'user_access_token不能为空'
            });
        }

        const response = await axios.get(
            'https://open.feishu.cn/open-apis/authen/v1/user_info',
            {
                headers: {
                    'Authorization': `Bearer ${userAccessToken}`
                }
            }
        );

        if (response.data.code === 0) {
            res.json({
                code: 0,
                data: {
                    name: response.data.data.name,
                    userId: response.data.data.user_id,
                    avatar: response.data.data.avatar_url,
                    email: response.data.data.email
                }
            });
        } else {
            throw new Error(`获取用户信息失败: ${response.data.msg}`);
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取用户信息失败',
            error: error.message
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        config: {
            appIdConfigured: !!FEISHU_CONFIG.APP_ID && FEISHU_CONFIG.APP_ID !== 'cli_your_app_id_here',
            appSecretConfigured: !!FEISHU_CONFIG.APP_SECRET && FEISHU_CONFIG.APP_SECRET !== 'your_app_secret_here'
        }
    });
});

// 清除缓存（用于调试）
app.post('/api/feishu/clear-cache', (req, res) => {
    tokenCache = {
        accessToken: null,
        accessTokenExpire: 0,
        jsapiTicket: null,
        jsapiTicketExpire: 0
    };
    res.json({
        code: 0,
        message: '缓存已清除'
    });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 飞书服务端已启动！');
    console.log(`📡 监听端口: ${PORT}`);
    console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
    console.log('========================================');
    console.log('');

    // 检查配置
    if (FEISHU_CONFIG.APP_ID === 'cli_your_app_id_here') {
        console.log('⚠️  警告: 请配置飞书App ID');
    }
    if (FEISHU_CONFIG.APP_SECRET === 'your_app_secret_here') {
        console.log('⚠️  警告: 请配置飞书App Secret');
    }

    console.log('');
    console.log('📝 配置步骤:');
    console.log('1. 访问飞书开放平台: https://open.feishu.cn/');
    console.log('2. 创建企业自建应用');
    console.log('3. 复制 App ID 和 App Secret');
    console.log('4. 修改 feishu-server.js 中的配置');
    console.log('5. 在应用管理后台配置权限和网页URL');
    console.log('========================================');
});

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('未处理的Promise拒绝:', error);
});
