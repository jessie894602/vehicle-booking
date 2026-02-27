// 车辆预定系统 - 主应用逻辑

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();

    // 检查是否有预定成功的提示
    const bookingSuccess = getUrlParameter('bookingSuccess');
    if (bookingSuccess === 'true') {
        const vehicleModel = getUrlParameter('vehicle');
        showBookingNotification(`预定成功！车辆：${vehicleModel || '未知车辆'}`);

        // 清除URL参数
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// 初始化应用
function initializeApp() {
    // 渲染车辆列表
    renderVehiclesList();

    // 绑定事件监听器
    bindEventListeners();
}

// 渲染车辆列表
async function renderVehiclesList() {
    const loadingState = document.getElementById('loadingState');
    const vehiclesGrid = document.getElementById('vehiclesGrid');
    const emptyState = document.getElementById('emptyState');

    try {
        // 获取所有车辆
        const vehicles = await dataManager.getAllVehicles();

        // 隐藏加载状态
        loadingState.classList.add('hidden');

        if (vehicles.length === 0) {
            // 显示空状态
            emptyState.classList.remove('hidden');
        } else {
            // 显示车辆网格
            vehiclesGrid.classList.remove('hidden');

            // 清空网格
            vehiclesGrid.innerHTML = '';

            // 渲染每个车辆卡片
            for (const vehicle of vehicles) {
                const card = await createVehicleCard(vehicle);
                vehiclesGrid.appendChild(card);
            }
        }
    } catch (error) {
        console.error('加载车辆列表失败:', error);
        loadingState.innerHTML = `
            <div class="alert alert-error">
                加载失败，请检查网络连接或联系管理员
            </div>
        `;
    }
}

// 创建车辆卡片元素
async function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.onclick = () => navigateToDetail(vehicle.id);

    // 获取车辆使用状态
    const vehicleStatus = await dataManager.getVehicleStatus(vehicle.id);
    const statusClass = vehicleStatus.status === 'in-use' ? 'vehicle-badge-busy' : 'vehicle-badge-free';
    const statusText = vehicleStatus.status === 'in-use' ? '使用中' : '空闲';

    card.innerHTML = `
        <div class="vehicle-booking-badge ${statusClass}">${statusText}</div>
        <div class="vehicle-info">
            <div class="vehicle-details">
                <div class="detail-item">
                    <span class="detail-label">车辆:</span>
                    <span class="detail-value">${vehicle.vehicle || vehicle.model || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">位置:</span>
                    <span class="detail-value">${vehicle.location || vehicle.city || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">颜色:</span>
                    <span class="detail-value">${vehicle.color || '-'}</span>
                </div>
                ${vehicle.plateNumber ? `
                <div class="detail-item">
                    <span class="detail-label">车牌:</span>
                    <span class="detail-value vehicle-plate">${vehicle.plateNumber}</span>
                </div>
                ` : ''}
                <div class="detail-item">
                    <span class="detail-label">阶段:</span>
                    <span class="detail-value">${vehicle.stage || '-'}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

// 导航到详情页
function navigateToDetail(vehicleId) {
    window.location.href = `detail.html?id=${vehicleId}`;
}

// 绑定事件监听器
function bindEventListeners() {
    // 我的预定链接
    const myBookingsLink = document.getElementById('myBookingsLink');
    if (myBookingsLink) {
        myBookingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMyBookings();
        });
    }
}

// 显示我的预定
function showMyBookings() {
    const bookings = dataManager.getAllBookings();

    if (bookings.length === 0) {
        alert('您还没有任何预定记录');
        return;
    }

    let message = '=== 我的预定记录 ===\n\n';

    bookings.forEach((booking, index) => {
        const vehicle = dataManager.getVehicleById(booking.vehicleId);
        const vehicleName = vehicle ? vehicle[FIELD_NAMES.model] : '未知车辆';

        message += `【预定 ${index + 1}】\n`;
        message += `车辆: ${vehicleName}\n`;
        message += `申请原因: ${booking[FIELD_NAMES.reason]}\n`;
        message += `开始时间: ${formatDateTime(booking[FIELD_NAMES.startTime])}\n`;
        message += `结束时间: ${formatDateTime(booking[FIELD_NAMES.endTime])}\n`;
        message += `申请人: ${booking[FIELD_NAMES.person]}\n`;
        message += `预定时间: ${formatDateTime(booking.createdAt)}\n`;
        message += '\n---\n\n';
    });

    alert(message);
}

// 格式化日期时间
function formatDateTime(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 工具函数：获取URL参数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 显示预定提示
function showBookingNotification(message) {
    const notification = document.getElementById('bookingNotification');
    const messageElement = notification.querySelector('.notification-message');

    messageElement.textContent = message;
    notification.classList.remove('hidden');

    // 5秒后自动关闭
    setTimeout(() => {
        closeNotification();
    }, 5000);
}

// 关闭提示框
function closeNotification() {
    const notification = document.getElementById('bookingNotification');
    notification.classList.add('hidden');
}
