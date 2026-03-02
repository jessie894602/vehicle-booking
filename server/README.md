# 飞书集成后端服务

车辆预定系统的飞书集成后端服务，用于自动获取飞书用户信息。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置飞书应用

编辑 `feishu-server.js`，填入你的飞书应用凭证：

```javascript
const FEISHU_CONFIG = {
    APP_ID: 'cli_your_app_id_here',       // 替换为你的App ID
    APP_SECRET: 'your_app_secret_here',   // 替换为你的App Secret
};
```

### 3. 启动服务

```bash
npm start
```

或使用开发模式（自动重启）：

```bash
npm run dev
```

### 4. 验证服务

访问 http://localhost:3000/health

## 详细配置

请查看项目根目录的 `飞书集成配置指南.md` 文件。

## API接口

### GET /api/feishu/jsapi-config

获取JSAPI签名配置

**参数：**
- `url` (必填) - 当前页面URL

**响应：**
```json
{
  "code": 0,
  "data": {
    "appId": "cli_xxx",
    "timestamp": 1234567890,
    "nonceStr": "abc123",
    "signature": "xxx"
  }
}
```

### POST /api/feishu/user-info

获取用户信息（需要user_access_token）

**请求体：**
```json
{
  "userAccessToken": "u-xxx"
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "name": "张三",
    "userId": "ou_xxx",
    "avatar": "https://...",
    "email": "zhangsan@example.com"
  }
}
```

### GET /health

健康检查接口

## 端口配置

默认端口：3000

如需修改，在 `feishu-server.js` 中更改：

```javascript
const PORT = 3000; // 改为其他端口
```

## 生产部署

### 使用PM2

```bash
npm install -g pm2
pm2 start feishu-server.js --name "feishu-server"
pm2 startup
pm2 save
```

### 使用Docker

```bash
docker build -t feishu-server .
docker run -d -p 3000:3000 feishu-server
```

## 故障排查

### 配置检查

访问 http://localhost:3000/health 查看配置状态

### 清除缓存

```bash
curl -X POST http://localhost:3000/api/feishu/clear-cache
```

## 依赖项

- express: Web服务框架
- cors: 跨域支持
- axios: HTTP客户端

## 许可证

MIT
