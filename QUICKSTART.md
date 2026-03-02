# 快速开始指南

## 方案3：飞书多维表格 + 现有界面集成

### 概述
此方案保留您当前的网页界面，使用飞书多维表格存储数据，实现多人实时共享预定信息。

---

## 步骤总览

1. ✅ **代码已准备完毕** - 后端服务器和前端API已创建
2. 📝 **配置飞书应用** - 需要您完成（15分钟）
3. 🚀 **部署和测试** - 启动服务器测试（10分钟）

---

## 第一步：配置飞书（15分钟）

### 1.1 创建飞书自建应用
1. 访问 https://open.feishu.cn/
2. 登录后点击"创建企业自建应用"
3. 应用名称：**车辆预定系统**
4. 创建完成后，记录：
   - **App ID**: `cli_xxxxxxxxx`
   - **App Secret**: 点击"查看"并记录

### 1.2 配置应用权限
在应用管理页面：
1. 点击"权限管理"
2. 添加权限：
   - `bitable:app` - 查看、编辑和管理多维表格
3. 点击"发布版本"

### 1.3 创建多维表格
1. 在飞书中创建多维表格：**车辆预定系统数据库**
2. 创建两个数据表：

**表1：车辆信息**
字段：
- 车辆ID（文本）
- 车辆编码（文本）
- 车辆型号（文本）
- 车系（文本）
- 车辆（文本）
- 车辆位置（文本）
- 车辆城市（文本）
- VIN码（文本）
- 车辆阶段（单选）
- 内外饰颜色（文本）
- 车牌号（文本）
- 车辆图片（文本）

**表2：预定记录**
字段：
- 预定ID（文本）
- 车辆ID（文本）
- 车辆型号（文本）
- 申请原因（文本）
- 开始时间（日期时间）
- 结束时间（日期时间）
- 申请人（文本）
- 创建时间（日期时间）
- 状态（单选：待审批/已批准/已还车）
- 是否已还车（复选框）
- 还车时间（日期时间）

### 1.4 导入车辆数据
从 `D:\gaoshujun\Desktop\产品部车辆管理清单.csv` 导入到"车辆信息"表

### 1.5 获取配置信息
- **App Token**: 打开多维表格 > 右上角"..." > 高级设置 > 复制 App Token
- **Table ID（车辆）**: 点击"车辆信息"表，从URL中找到 `table=tblXXXXX`
- **Table ID（预定）**: 点击"预定记录"表，从URL中找到 `table=tblYYYYY`

---

## 第二步：配置服务器（5分钟）

### 2.1 创建环境配置文件
在 `server` 文件夹中，复制配置文件：

```bash
cd C:\Users\gaoshujun\vehicle-booking-system\server
copy .env.example .env
```

### 2.2 编辑 `.env` 文件
用记事本打开 `.env`，填入您在第一步获取的信息：

```env
# 飞书应用配置
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 飞书多维表格配置
FEISHU_APP_TOKEN=bascnXXXXXXXXXXXXXXXXX
FEISHU_VEHICLES_TABLE_ID=tblXXXXXXXXXXXXXXX
FEISHU_BOOKINGS_TABLE_ID=tblYYYYYYYYYYYYYYY

# 服务器配置
PORT=3000
```

---

## 第三步：安装和启动（5分钟）

### 3.1 安装依赖
打开命令提示符（CMD）：

```bash
cd C:\Users\gaoshujun\vehicle-booking-system\server
npm install
```

等待安装完成（大约1-2分钟）

### 3.2 启动服务器
```bash
npm start
```

看到以下输出说明成功：
```
🚀 服务器运行在 http://localhost:3000
📋 健康检查: http://localhost:3000/api/health
```

### 3.3 测试API
打开浏览器访问：http://localhost:3000/api/health

应该看到：`{"status":"ok","message":"服务运行正常"}`

---

## 第四步：测试系统（5分钟）

### 4.1 打开网页
在浏览器中打开：`C:\Users\gaoshujun\vehicle-booking-system\index.html`

### 4.2 测试功能
- 查看车辆列表（应该显示飞书表格中的车辆）
- 点击车辆进入详情页
- 填写预定表单并提交
- 在飞书多维表格中查看预定记录

### 4.3 多人测试
- 在另一台电脑或手机上打开网页
- 同时操作，验证数据同步

---

## 第五步：部署到公网（可选，30分钟）

如果需要通过互联网访问（推荐）：

### 方案A：使用 Render（免费）

1. 访问 https://render.com 注册账号
2. 点击 "New +" > "Web Service"
3. 连接GitHub或上传代码
4. 配置：
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
5. 添加环境变量（复制.env内容）
6. 部署完成后获得URL

### 方案B：使用 Railway（免费）

1. 访问 https://railway.app 注册
2. 创建新项目
3. 部署后端服务
4. 添加环境变量
5. 获得公网URL

### 修改前端配置
编辑 `js/feishu-api.js` 第3行：
```javascript
const API_BASE_URL = 'https://your-deployed-url.com/api';
```

---

## 第六步：配置飞书自建应用（可选）

如果要在飞书工作台中打开：

1. 将网页部署到公网（使用Netlify或Vercel）
2. 在飞书开放平台配置网页地址
3. 发布应用
4. 在飞书工作台打开使用

详细步骤见：`FEISHU_SETUP.md`

---

## 常见问题

### Q: npm install 失败
**解决**：
- 确保已安装 Node.js（https://nodejs.org/）
- 使用管理员权限运行命令提示符
- 尝试：`npm install --registry=https://registry.npmmirror.com`

### Q: 页面显示"加载失败"
**解决**：
- 确认服务器已启动（http://localhost:3000/api/health）
- 检查浏览器控制台错误信息
- 确认 `.env` 配置正确

### Q: 无法写入飞书表格
**解决**：
- 检查应用权限是否已发布
- 确认 App Token 和 Table ID 正确
- 查看服务器控制台错误日志

### Q: 多人数据不同步
**解决**：
- 刷新页面（数据有30秒缓存）
- 确保都连接到同一个后端服务器
- 检查飞书表格是否有权限限制

---

## 下一步

✅ 基本功能已完成，可以开始使用！

可选优化：
- 添加飞书登录集成
- 配置预定审批流程
- 添加消息通知
- 创建数据统计报表

---

需要帮助？
- 查看详细文档：`FEISHU_SETUP.md`
- 飞书API文档：https://open.feishu.cn/document/
