// 用户管理模块
class UserManager {
    constructor() {
        this.storageKey = 'vehicle_booking_user';
        // 管理员名单
        this.adminList = ['高淑珺', '王聪', '王嘉伟'];
        this.deviceId = null;
    }

    // 生成设备指纹
    generateDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            navigator.language,
            navigator.hardwareConcurrency || 0,
            new Date().getTimezoneOffset(),
            navigator.platform,
            navigator.maxTouchPoints || 0
        ];

        const fingerprint = components.join('|');
        return this.simpleHash(fingerprint);
    }

    // 简单哈希函数
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'device_' + Math.abs(hash).toString(36);
    }

    // 获取设备ID
    getDeviceId() {
        if (!this.deviceId) {
            this.deviceId = this.generateDeviceFingerprint();
        }
        return this.deviceId;
    }

    // 获取当前用户姓名
    getCurrentUser() {
        return localStorage.getItem(this.storageKey) || null;
    }

    // 检查当前用户是否是管理员
    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && this.adminList.includes(currentUser);
    }

    // 保存用户姓名
    saveUser(name) {
        if (name && name.trim()) {
            localStorage.setItem(this.storageKey, name.trim());
            return true;
        }
        return false;
    }

    // 清除用户信息（用于切换用户）
    clearUser() {
        localStorage.removeItem(this.storageKey);
    }

    // 检查是否是首次访问
    isFirstVisit() {
        return !this.getCurrentUser();
    }

    // 显示欢迎弹窗
    showWelcomeModal() {
        return new Promise((resolve) => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.className = 'welcome-overlay';

            // 创建弹窗
            const modal = document.createElement('div');
            modal.className = 'welcome-modal';
            modal.innerHTML = `
                <div class="welcome-header">
                    <div class="welcome-icon">👋</div>
                    <h2>欢迎使用车辆预定系统</h2>
                </div>
                <div class="welcome-body">
                    <p>为了更好地为您服务，请输入您的姓名</p>
                    <p class="welcome-hint">您的姓名将保存在本电脑上，用于预定车辆时自动填写</p>
                    <div class="form-group">
                        <input
                            type="text"
                            id="welcomeNameInput"
                            class="form-control"
                            placeholder="请输入您的姓名"
                            autofocus
                        >
                        <div id="welcomeError" class="welcome-error hidden"></div>
                    </div>
                </div>
                <div class="welcome-footer">
                    <button id="welcomeSubmitBtn" class="welcome-btn welcome-btn-primary">
                        开始使用
                    </button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // 获取元素
            const nameInput = document.getElementById('welcomeNameInput');
            const submitBtn = document.getElementById('welcomeSubmitBtn');
            const errorDiv = document.getElementById('welcomeError');

            // 提交函数
            const handleSubmit = () => {
                const name = nameInput.value.trim();

                // 验证姓名
                if (!name) {
                    errorDiv.textContent = '请输入您的姓名';
                    errorDiv.classList.remove('hidden');
                    nameInput.focus();
                    return;
                }

                if (name.length < 2) {
                    errorDiv.textContent = '姓名至少需要2个字符';
                    errorDiv.classList.remove('hidden');
                    nameInput.focus();
                    return;
                }

                // 保存用户名
                this.saveUser(name);

                // 添加关闭动画
                modal.style.animation = 'slideOut 0.3s ease-out';
                overlay.style.animation = 'fadeOut 0.3s ease-out';

                setTimeout(() => {
                    document.body.removeChild(overlay);
                    resolve(name);
                }, 300);
            };

            // 绑定事件
            submitBtn.addEventListener('click', handleSubmit);

            // 支持回车提交
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            });

            // 输入时隐藏错误提示
            nameInput.addEventListener('input', () => {
                errorDiv.classList.add('hidden');
            });
        });
    }

    // 显示用户信息指示器
    showUserIndicator() {
        const userName = this.getCurrentUser();
        if (!userName) return;

        // 检查是否已存在指示器
        if (document.getElementById('userIndicator')) return;

        // 检查是否是管理员
        const isAdmin = this.isAdmin();
        const adminBadge = isAdmin ? '<span class="admin-badge">管理员</span>' : '';

        // 创建用户指示器（包含切换用户按钮）
        const indicator = document.createElement('div');
        indicator.id = 'userIndicator';
        indicator.className = 'user-indicator';
        indicator.innerHTML = `
            <span class="user-name">👤 ${userName}${adminBadge}</span>
            <button class="switch-user-btn" id="switchUserBtn" title="切换用户">🔄</button>
        `;

        // 插入到导航栏链接的最后
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.appendChild(indicator);
        }

        // 绑定切换用户按钮事件
        const switchBtn = document.getElementById('switchUserBtn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => this.switchUser());
        }
    }

    // 切换用户功能
    async switchUser() {
        const currentUser = this.getCurrentUser();
        const confirmed = confirm(`当前用户: ${currentUser}\n\n是否切换到其他用户？\n\n注意：切换后，此设备将绑定到新用户。`);

        if (!confirmed) return;

        // 清除当前用户
        this.clearUser();

        // 显示欢迎弹窗让用户重新输入
        const newUser = await this.showWelcomeModal();

        // 更新设备绑定
        if (newUser) {
            const deviceId = this.getDeviceId();
            await dataManager.bindDeviceToUser(deviceId, newUser);
            console.log('已更新设备绑定:', deviceId, newUser);

            // 刷新页面以应用新用户
            location.reload();
        }
    }

    // 初始化用户系统
    async init() {
        // 获取设备ID
        const deviceId = this.getDeviceId();
        console.log('设备ID:', deviceId);

        // 检查设备是否已绑定用户
        const boundUser = await dataManager.getDeviceBinding(deviceId);

        if (boundUser) {
            // 设备已绑定用户，直接使用
            console.log('设备已绑定用户:', boundUser);
            this.saveUser(boundUser);
        } else {
            // 设备未绑定，检查是否首次访问
            if (this.isFirstVisit()) {
                // 首次访问，显示欢迎弹窗
                const userName = await this.showWelcomeModal();

                // 绑定设备和用户
                if (userName) {
                    await dataManager.bindDeviceToUser(deviceId, userName);
                    console.log('已绑定设备和用户:', deviceId, userName);
                }
            } else {
                // 有本地用户记录，绑定设备
                const localUser = this.getCurrentUser();
                if (localUser) {
                    await dataManager.bindDeviceToUser(deviceId, localUser);
                    console.log('已绑定设备和本地用户:', deviceId, localUser);
                }
            }
        }

        // 显示用户指示器
        this.showUserIndicator();
    }
}

// 创建全局实例
const userManager = new UserManager();
