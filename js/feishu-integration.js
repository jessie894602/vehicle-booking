// 飞书集成模块 - 自动获取用户信息

class FeishuIntegration {
    constructor() {
        this.serverUrl = 'http://localhost:3000'; // 后端服务地址
        this.isFeishuEnv = this.checkFeishuEnvironment();
    }

    // 检测是否在飞书环境中
    checkFeishuEnvironment() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('lark') || ua.includes('feishu');
    }

    // 初始化飞书 JSAPI
    async initFeishuJSAPI() {
        if (!this.isFeishuEnv) {
            console.log('不在飞书环境中');
            return false;
        }

        // 加载飞书 JSAPI SDK
        return new Promise((resolve) => {
            if (window.h5sdk) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.16.js';
            script.onload = () => {
                console.log('飞书 JSAPI SDK 加载成功');
                resolve(true);
            };
            script.onerror = () => {
                console.error('飞书 JSAPI SDK 加载失败');
                resolve(false);
            };
            document.head.appendChild(script);
        });
    }

    // 获取JSAPI配置（从后端服务器）
    async getJSAPIConfig() {
        try {
            const url = window.location.href.split('#')[0]; // 去掉hash部分
            const response = await fetch(`${this.serverUrl}/api/feishu/jsapi-config?url=${encodeURIComponent(url)}`);

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();

            if (result.code === 0) {
                return result.data;
            } else {
                throw new Error(result.message || '获取JSAPI配置失败');
            }
        } catch (error) {
            console.error('获取JSAPI配置失败:', error);
            return null;
        }
    }

    // 获取用户信息
    async getUserInfo() {
        if (!this.isFeishuEnv) {
            console.log('不在飞书环境中，跳过获取用户信息');
            return null;
        }

        try {
            // 初始化JSAPI SDK
            const sdkLoaded = await this.initFeishuJSAPI();
            if (!sdkLoaded || !window.h5sdk) {
                console.error('飞书 SDK 未加载');
                return null;
            }

            // 获取JSAPI配置
            const config = await this.getJSAPIConfig();
            if (!config) {
                console.error('无法获取JSAPI配置');
                return null;
            }

            // 配置JSAPI
            await new Promise((resolve, reject) => {
                window.h5sdk.config({
                    appId: config.appId,
                    timestamp: config.timestamp,
                    nonceStr: config.nonceStr,
                    signature: config.signature,
                    jsApiList: ['biz.contact.choose', 'biz.util.getUserInfo'],
                    onSuccess: () => {
                        console.log('✓ 飞书 JSAPI 配置成功');
                        resolve();
                    },
                    onFail: (err) => {
                        console.error('✗ 飞书 JSAPI 配置失败:', err);
                        reject(err);
                    }
                });
            });

            // 等待SDK准备完成
            await new Promise((resolve) => {
                window.h5sdk.ready(() => {
                    console.log('✓ 飞书 SDK 准备完成');
                    resolve();
                });
            });

            // 获取用户信息
            return new Promise((resolve) => {
                window.h5sdk.ready(() => {
                    tt.getUserInfo({
                        success: (res) => {
                            console.log('✓ 获取用户信息成功:', res);

                            // 保存到本地，下次自动使用
                            if (res.nickName) {
                                this.saveUserInfo(res.nickName);
                            }

                            resolve({
                                name: res.nickName || res.userName || '未知用户',
                                userId: res.userId || '',
                                avatar: res.avatarUrl || ''
                            });
                        },
                        fail: (err) => {
                            console.error('✗ 获取用户信息失败:', err);
                            resolve(null);
                        }
                    });
                });
            });

        } catch (error) {
            console.error('飞书集成错误:', error);
            return null;
        }
    }

    // 简化方案：使用 localStorage 存储用户信息
    // 用户首次访问时手动输入，之后自动填充
    saveUserInfo(name) {
        if (name && name.trim()) {
            localStorage.setItem('feishu_user_name', name.trim());
            console.log('✓ 已保存用户名到本地:', name.trim());
        }
    }

    getSavedUserInfo() {
        return localStorage.getItem('feishu_user_name') || '';
    }

    clearSavedUserInfo() {
        localStorage.removeItem('feishu_user_name');
        console.log('✓ 已清除本地保存的用户名');
    }
}

// 创建全局实例
const feishuIntegration = new FeishuIntegration();
