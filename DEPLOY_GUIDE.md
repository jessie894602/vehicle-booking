# 🚀 车辆预定系统 - GitHub Pages 部署指南

## 📋 部署步骤

### 第1步：准备 GitHub 账号

1. 访问 https://github.com
2. 如果没有账号，点击 "Sign up" 注册
3. 如果有账号，点击 "Sign in" 登录

---

### 第2步：创建新仓库（Repository）

1. 登录后，点击右上角的 **+** 号
2. 选择 **"New repository"**
3. 填写信息：
   - **Repository name**: `vehicle-booking-system` (必须使用这个名字)
   - **Description**: 车辆预定系统
   - **Public** (选择公开)
   - ✅ 勾选 **"Add a README file"**
4. 点击 **"Create repository"** 创建仓库

---

### 第3步：上传文件到 GitHub

**方法A：通过网页上传（简单）**

1. 在仓库页面，点击 **"Add file"** → **"Upload files"**
2. 把整个 `vehicle-booking-system` 文件夹里的**所有文件和文件夹**拖到页面上：
   - index.html
   - detail.html
   - statistics.html
   - manage-vehicles.html
   - css/ 文件夹
   - js/ 文件夹
   - （所有其他文件）
3. 在底部填写提交信息：`Initial commit - 上传车辆预定系统`
4. 点击 **"Commit changes"** 提交

**方法B：使用 GitHub Desktop（推荐，更方便）**

1. 下载并安装 GitHub Desktop: https://desktop.github.com
2. 登录你的 GitHub 账号
3. 点击 **"Clone a repository"**
4. 选择你刚创建的 `vehicle-booking-system` 仓库
5. 选择保存位置并克隆
6. 把你电脑上的所有文件复制到克隆下来的文件夹里
7. 在 GitHub Desktop 中：
   - 看到所有修改的文件
   - 填写提交信息：`Initial commit`
   - 点击 **"Commit to main"**
   - 点击 **"Push origin"** 推送到 GitHub

---

### 第4步：启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 **"Settings"**（设置）
2. 在左侧菜单找到 **"Pages"**
3. 在 **"Source"** 部分：
   - Branch: 选择 **"main"**
   - Folder: 选择 **"/ (root)"**
4. 点击 **"Save"** 保存
5. 等待 1-2 分钟，页面会显示：
   ```
   ✅ Your site is live at https://你的用户名.github.io/vehicle-booking-system/
   ```

---

### 第5步：访问你的网站

访问地址格式：
```
https://你的GitHub用户名.github.io/vehicle-booking-system/
```

例如，如果你的 GitHub 用户名是 `zhangsan`，网址就是：
```
https://zhangsan.github.io/vehicle-booking-system/
```

---

## 🎯 分享给其他人

部署成功后，把网址发给团队成员：
- 他们打开网址就能使用
- 不需要下载任何文件
- 所有人共享同一个 JSONBin 数据
- 任何人的预定都会实时同步

---

## 🔄 更新网站内容

如果你修改了代码，需要更新网站：

**使用 GitHub Desktop：**
1. 修改本地文件
2. 打开 GitHub Desktop
3. 填写提交信息
4. 点击 "Commit" 然后 "Push"
5. 等待 1-2 分钟，网站自动更新

**使用网页：**
1. 在仓库页面找到要修改的文件
2. 点击文件名，然后点击铅笔图标 ✏️ 编辑
3. 修改后点击 "Commit changes"
4. 等待 1-2 分钟，网站自动更新

---

## ⚠️ 注意事项

1. **API Key 安全**：你的 Master Key 在代码里，任何能看到代码的人都能修改数据
   - 适合内部团队使用
   - 不要分享给不信任的人

2. **首次部署可能需要等待**：GitHub Pages 首次部署可能需要 5-10 分钟

3. **自定义域名**（可选）：如果你有自己的域名，可以在 GitHub Pages 设置中配置

---

## 📱 测试部署

部署成功后，测试这些功能：
- ✅ 打开首页，看到车辆列表
- ✅ 点击车辆卡片，进入详情页
- ✅ 提交预定，看到成功提示
- ✅ 在另一台设备打开同样的网址，应该能看到刚才的预定记录

---

## 🆘 常见问题

**Q: 网页显示 404 错误？**
A:
- 确认 index.html 在仓库根目录
- 确认 GitHub Pages 已启用
- 等待 5-10 分钟再试

**Q: 网页显示但没有样式？**
A:
- 确认 css/ 文件夹已上传
- 检查浏览器控制台（F12）是否有错误

**Q: 车辆信息不显示？**
A:
- 确认 js/ 文件夹已上传
- 确认 JSONBin API Key 正确
- 检查浏览器控制台（F12）是否有错误

---

## 🎉 完成！

现在你的车辆预定系统已经在线了！

任何人通过网址都能访问，无需下载或安装任何东西。
