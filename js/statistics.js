// 车辆使用统计 - JavaScript

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    bindEventListeners();
});

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

// 加载统计数据
async function loadStatistics() {
    try {
        const bookings = await dataManager.getAllBookings();
        const vehicles = await dataManager.getAllVehicles();

        // 计算每辆车的统计数据
        const statistics = calculateStatistics(vehicles, bookings);

        // 计算总体统计
        let totalUsages = 0;
        let totalHours = 0;
        const allUsers = new Set();
        let totalUtilization = 0;

        statistics.forEach(stat => {
            totalUsages += stat.totalUsages;
            totalHours += stat.totalHours;
            totalUtilization += stat.utilization;
            stat.users.forEach(user => allUsers.add(user));
        });

        const avgUtilization = statistics.length > 0 ? (totalUtilization / statistics.length).toFixed(1) : 0;

        // 更新概览卡片
        document.getElementById('totalVehicles').textContent = vehicles.length;
        document.getElementById('totalUsages').textContent = totalUsages;
        document.getElementById('totalHours').textContent = totalHours.toFixed(1);
        document.getElementById('totalUsers').textContent = allUsers.size;

        // 渲染车辆统计列表
        renderVehicleStatistics(statistics);

    } catch (error) {
        console.error('加载统计数据失败:', error);
        document.getElementById('emptyState').classList.remove('hidden');
    }
}

// 计算统计数据
function calculateStatistics(vehicles, bookings) {
    const now = new Date();
    const stats30Days = 30 * 24; // 30天的总小时数

    return vehicles.map(vehicle => {
        // 筛选该车辆的预定记录
        const vehicleBookings = bookings.filter(b => b.vehicleId === vehicle.id);

        // 计算使用次数
        const totalUsages = vehicleBookings.length;

        // 计算总使用时长（小时）
        let totalHours = 0;
        let recentHours = 0; // 最近30天的使用时长
        const users = new Set();
        let lastUsedTime = null;

        vehicleBookings.forEach(booking => {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            const duration = (endTime - startTime) / (1000 * 60 * 60); // 转换为小时

            totalHours += duration;
            users.add(booking.person);

            // 更新最后使用时间
            if (!lastUsedTime || startTime > lastUsedTime) {
                lastUsedTime = startTime;
            }

            // 计算最近30天的使用时长
            const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
            if (startTime >= thirtyDaysAgo) {
                recentHours += duration;
            }
        });

        // 计算利用率（最近30天）
        const utilization = (recentHours / stats30Days * 100).toFixed(1);

        // 计算平均每次使用时长
        const avgHoursPerUse = totalUsages > 0 ? (totalHours / totalUsages).toFixed(1) : 0;

        // 找出使用最多的用户
        const userCounts = {};
        vehicleBookings.forEach(booking => {
            userCounts[booking.person] = (userCounts[booking.person] || 0) + 1;
        });

        let topUser = '-';
        if (Object.keys(userCounts).length > 0) {
            const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
            topUser = `${sortedUsers[0][0]} (${sortedUsers[0][1]}次)`;
        }

        return {
            vehicle,
            totalUsages,
            totalHours,
            avgHoursPerUse,
            utilization: parseFloat(utilization),
            users: Array.from(users),
            topUser,
            lastUsedTime: lastUsedTime ? lastUsedTime.toISOString() : null
        };
    });
}

// 渲染车辆统计列表
function renderVehicleStatistics(statistics) {
    const statisticsList = document.getElementById('statisticsList');
    const emptyState = document.getElementById('emptyState');

    // 检查是否有使用数据
    const hasUsage = statistics.some(stat => stat.totalUsages > 0);

    if (!hasUsage) {
        statisticsList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    statisticsList.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // 按使用次数降序排序
    statistics.sort((a, b) => b.totalUsages - a.totalUsages);

    // 渲染统计卡片
    statisticsList.innerHTML = statistics.map(stat => {
        const hasData = stat.totalUsages > 0;
        const vehicle = stat.vehicle;

        // 利用率颜色
        let utilizationColor = '#999';
        if (stat.utilization >= 50) utilizationColor = '#50C878'; // 绿色 - 高利用率
        else if (stat.utilization >= 20) utilizationColor = '#FFA500'; // 橙色 - 中等利用率
        else if (stat.utilization > 0) utilizationColor = '#E94B3C'; // 红色 - 低利用率

        return `
            <div class="stat-vehicle-card ${!hasData ? 'no-data' : ''}">
                <div class="stat-vehicle-header">
                    <div class="stat-vehicle-info">
                        <img src="${vehicle.image || 'images/default.jpg'}" alt="${vehicle.model || vehicle.vehicle}" class="stat-vehicle-image"
                             onerror="this.src='images/default.jpg'" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
                        <div>
                            <h3 class="stat-vehicle-model">${vehicle.model || vehicle.vehicle}</h3>
                            <p class="stat-vehicle-details" style="color: #666; font-size: 13px; margin-top: 3px;">
                                ${vehicle.city || '-'} · ${vehicle.code || '-'}
                            </p>
                        </div>
                    </div>
                    ${hasData ? '<span class="stat-badge-active" style="background: #50C878; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px;">已使用</span>' : '<span class="stat-badge-inactive" style="background: #ddd; color: #666; padding: 4px 12px; border-radius: 12px; font-size: 13px;">未使用</span>'}
                </div>

                ${hasData ? `
                <div class="stat-vehicle-metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 15px 0;">
                    <div class="stat-metric" style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div class="metric-icon" style="font-size: 24px; margin-bottom: 5px;">📈</div>
                        <div class="metric-value" style="font-size: 20px; font-weight: bold; color: #333;">${stat.totalUsages}</div>
                        <div class="metric-label" style="font-size: 12px; color: #666; margin-top: 3px;">使用次数</div>
                    </div>
                    <div class="stat-metric" style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div class="metric-icon" style="font-size: 24px; margin-bottom: 5px;">⏰</div>
                        <div class="metric-value" style="font-size: 20px; font-weight: bold; color: #333;">${stat.totalHours.toFixed(1)}</div>
                        <div class="metric-label" style="font-size: 12px; color: #666; margin-top: 3px;">总时长(小时)</div>
                    </div>
                    <div class="stat-metric" style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div class="metric-icon" style="font-size: 24px; margin-bottom: 5px;">⌀</div>
                        <div class="metric-value" style="font-size: 20px; font-weight: bold; color: #333;">${stat.avgHoursPerUse}</div>
                        <div class="metric-label" style="font-size: 12px; color: #666; margin-top: 3px;">平均时长(小时)</div>
                    </div>
                    <div class="stat-metric" style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div class="metric-icon" style="font-size: 24px; margin-bottom: 5px;">📊</div>
                        <div class="metric-value" style="font-size: 20px; font-weight: bold; color: ${utilizationColor};">${stat.utilization}%</div>
                        <div class="metric-label" style="font-size: 12px; color: #666; margin-top: 3px;">利用率(30天)</div>
                    </div>
                    <div class="stat-metric" style="background: #f8f9fa; padding: 12px; border-radius: 8px; text-align: center;">
                        <div class="metric-icon" style="font-size: 24px; margin-bottom: 5px;">👥</div>
                        <div class="metric-value" style="font-size: 20px; font-weight: bold; color: #333;">${stat.users.length}</div>
                        <div class="metric-label" style="font-size: 12px; color: #666; margin-top: 3px;">使用人数</div>
                    </div>
                </div>

                <div class="stat-vehicle-details-section" style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <div class="stat-detail-row" style="display: flex; justify-content: space-between; padding: 6px 0;">
                        <span class="stat-detail-label" style="color: #666; font-size: 13px;">最常使用:</span>
                        <span class="stat-detail-value" style="color: #333; font-weight: 500; font-size: 13px;">${stat.topUser}</span>
                    </div>
                    <div class="stat-detail-row" style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid #e0e0e0;">
                        <span class="stat-detail-label" style="color: #666; font-size: 13px;">最后使用:</span>
                        <span class="stat-detail-value" style="color: #333; font-weight: 500; font-size: 13px;">${formatDateTime(stat.lastUsedTime)}</span>
                    </div>
                </div>
                ` : `
                <div class="stat-no-data" style="text-align: center; padding: 30px; color: #999;">
                    <p>该车辆还未被使用过</p>
                </div>
                `}
            </div>
        `;
    }).join('');
}

// 显示我的预定
async function showMyBookings() {
    try {
        // 获取当前用户姓名
        let currentUser = localStorage.getItem('feishu_user_name');

        // 如果没有保存的姓名，提示用户输入
        if (!currentUser) {
            currentUser = prompt('请输入您的姓名以查看您的预定记录:');
            if (!currentUser || !currentUser.trim()) {
                return;
            }
            currentUser = currentUser.trim();
        }

        const bookings = await dataManager.getAllBookings();

        // 筛选出当前用户的未还车预定记录
        const myBookings = bookings.filter(b => b.person === currentUser && !b.returned);

        if (!myBookings || myBookings.length === 0) {
            alert(`${currentUser}，您还没有进行中的预定`);
            return;
        }

        let message = `=== ${currentUser} 的预定记录 ===\n\n`;

        for (let index = 0; index < myBookings.length; index++) {
            const booking = myBookings[index];
            const vehicle = await dataManager.getVehicleById(booking.vehicleId);
            const vehicleName = vehicle ? (vehicle.model || vehicle.vehicle) : '未知车辆';

            message += `【预定 ${index + 1}】\n`;
            message += `车辆: ${vehicleName}\n`;
            message += `申请原因: ${booking.reason}\n`;
            message += `开始时间: ${formatDateTime(booking.startTime)}\n`;
            message += `结束时间: ${formatDateTime(booking.endTime)}\n`;
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
