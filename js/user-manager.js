// 用户管理模块
class UserManager {
    constructor() {
        this.storageKey = 'vehicle_booking_user';
        // 管理员名单
        this.adminList = ['高淑珺', '王聪'];
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

        // 创建用户指示器（不含切换用户按钮）
        const indicator = document.createElement('div');
        indicator.id = 'userIndicator';
        indicator.className = 'user-indicator';
        indicator.innerHTML = `
            <span class="user-name">👤 ${userName}${adminBadge}</span>
        `;

        // 插入到导航栏链接的最后
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.appendChild(indicator);
        }
    }

    // 移除切换用户功能 - 用户名与电脑永久绑定
    // async switchUser() {
    //     // 功能已禁用
    // }

    // 初始化用户系统
    async init() {
        if (this.isFirstVisit()) {
            // 首次访问，显示欢迎弹窗
            await this.showWelcomeModal();
        }

        // 显示用户指示器
        this.showUserIndicator();
    }
}

// 创建全局实例
const userManager = new UserManager();
