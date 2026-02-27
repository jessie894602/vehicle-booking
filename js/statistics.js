// 车辆使用统计 - JavaScript

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    bindEventListeners();
});

// 绑定事件监听器
function bindEventListeners() {
    // 清除统计按钮
    document.getElementById('clearStatsBtn').addEventListener('click', clearAllStatistics);

    // 我的预定链接
    const myBookingsLink = document.getElementById('myBookingsLink');
    if (myBookingsLink) {
        myBookingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMyBookings();
        });
    }
}

// 加载统计数据
function loadStatistics() {
    const statistics = dataManager.getAllStatistics();
    const vehicles = dataManager.getAllVehicles();

    // 计算总体统计
    let totalUsages = 0;
    let totalHours = 0;
    const allUsers = new Set();

    Object.values(statistics).forEach(stat => {
        totalUsages += stat.totalUsages;
        totalHours += stat.totalHours;
        Object.keys(stat.users).forEach(user => allUsers.add(user));
    });

    // 更新概览卡片
    document.getElementById('totalVehicles').textContent = vehicles.length;
    document.getElementById('totalUsages').textContent = totalUsages;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('totalUsers').textContent = allUsers.size;

    // 渲染车辆统计列表
    renderVehicleStatistics(vehicles, statistics);
}

// 渲染车辆统计列表
function renderVehicleStatistics(vehicles, statistics) {
    const statisticsList = document.getElementById('statisticsList');
    const emptyState = document.getElementById('emptyState');

    // 检查是否有统计数据
    const hasStatistics = Object.keys(statistics).length > 0;

    if (!hasStatistics) {
        statisticsList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    statisticsList.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // 创建包含统计的车辆数组
    const vehiclesWithStats = vehicles.map(vehicle => {
        const stat = statistics[vehicle.id] || {
            totalUsages: 0,
            totalHours: 0,
            lastUsedTime: null,
            users: {}
        };

        return {
            vehicle,
            stat
        };
    });

    // 按使用次数降序排序
    vehiclesWithStats.sort((a, b) => b.stat.totalUsages - a.stat.totalUsages);

    // 渲染统计卡片
    statisticsList.innerHTML = vehiclesWithStats.map(({ vehicle, stat }) => {
        const hasData = stat.totalUsages > 0;
        const usersCount = Object.keys(stat.users).length;
        const avgHoursPerUse = stat.totalUsages > 0 ? (stat.totalHours / stat.totalUsages).toFixed(1) : 0;

        // 获取使用最多的用户
        let topUser = '-';
        if (usersCount > 0) {
            const sortedUsers = Object.entries(stat.users).sort((a, b) => b[1] - a[1]);
            topUser = `${sortedUsers[0][0]} (${sortedUsers[0][1]}次)`;
        }

        return `
            <div class="stat-vehicle-card ${!hasData ? 'no-data' : ''}">
                <div class="stat-vehicle-header">
                    <div class="stat-vehicle-info">
                        <img src="${vehicle.image}" alt="${vehicle[FIELD_NAMES.model]}" class="stat-vehicle-image">
                        <div>
                            <h3 class="stat-vehicle-model">${vehicle[FIELD_NAMES.model]}</h3>
                            <p class="stat-vehicle-details">
                                ${vehicle[FIELD_NAMES.series]} · ${vehicle[FIELD_NAMES.city]} · ${vehicle[FIELD_NAMES.code]}
                            </p>
                        </div>
                    </div>
                    ${hasData ? '<span class="stat-badge-active">使用中</span>' : '<span class="stat-badge-inactive">未使用</span>'}
                </div>

                ${hasData ? `
                <div class="stat-vehicle-metrics">
                    <div class="stat-metric">
                        <div class="metric-icon">📈</div>
                        <div class="metric-content">
                            <div class="metric-value">${stat.totalUsages}</div>
                            <div class="metric-label">使用次数</div>
                        </div>
                    </div>
                    <div class="stat-metric">
                        <div class="metric-icon">⏰</div>
                        <div class="metric-content">
                            <div class="metric-value">${stat.totalHours.toFixed(1)}</div>
                            <div class="metric-label">总时长(小时)</div>
                        </div>
                    </div>
                    <div class="stat-metric">
                        <div class="metric-icon">⌀</div>
                        <div class="metric-content">
                            <div class="metric-value">${avgHoursPerUse}</div>
                            <div class="metric-label">平均时长(小时)</div>
                        </div>
                    </div>
                    <div class="stat-metric">
                        <div class="metric-icon">👤</div>
                        <div class="metric-content">
                            <div class="metric-value">${usersCount}</div>
                            <div class="metric-label">使用人数</div>
                        </div>
                    </div>
                </div>

                <div class="stat-vehicle-details-section">
                    <div class="stat-detail-row">
                        <span class="stat-detail-label">最常使用:</span>
                        <span class="stat-detail-value">${topUser}</span>
                    </div>
                    <div class="stat-detail-row">
                        <span class="stat-detail-label">最后使用:</span>
                        <span class="stat-detail-value">${formatDateTime(stat.lastUsedTime)}</span>
                    </div>
                </div>
                ` : `
                <div class="stat-no-data">
                    <p>该车辆还未被使用过</p>
                </div>
                `}
            </div>
        `;
    }).join('');
}

// 清除所有统计
function clearAllStatistics() {
    if (confirm('确认清除所有使用统计数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：您真的要删除所有统计数据吗？')) {
            const success = dataManager.clearStatistics();
            if (success) {
                alert('已清除所有统计数据！');
                loadStatistics();
            } else {
                alert('清除失败，请重试');
            }
        }
    }
}

// 显示我的预定
async function showMyBookings() {
    try {
        const bookings = await dataManager.getAllBookings();

        if (!bookings || bookings.length === 0) {
            alert('您还没有任何预定记录');
            return;
        }

        let message = '=== 我的预定记录 ===\n\n';

        for (let index = 0; index < bookings.length; index++) {
            const booking = bookings[index];
            const vehicle = await dataManager.getVehicleById(booking.vehicleId);
            const vehicleName = vehicle ? (vehicle.model || vehicle.vehicle) : '未知车辆';

            message += `【预定 ${index + 1}】\n`;
            message += `车辆: ${vehicleName}\n`;
            message += `申请原因: ${booking.reason}\n`;
            message += `开始时间: ${formatDateTime(booking.startTime)}\n`;
            message += `结束时间: ${formatDateTime(booking.endTime)}\n`;
            message += `申请人: ${booking.person}\n`;
            message += `状态: ${booking.returned ? '已还车' : '使用中'}\n`;
            message += `预定时间: ${formatDateTime(booking.createdAt)}\n`;
            message += '\n---\n\n';
        }

        alert(message);
    } catch (error) {
        console.error('加载预定记录失败:', error);
        alert('加载预定记录失败，请稍后重试');
    }
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
