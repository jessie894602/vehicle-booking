// 车辆使用统计 - JavaScript
// 更新时间: 2026-03-02 17:10
// 版本: v2.1 - 修复初始化顺序

console.log('=== Statistics.js 加载成功 ===');
console.log('文件版本: v2.1');
console.log('更新时间: 2026-03-02 17:10');

// 统计页面初始化函数（由HTML调用）
window.initStatisticsPage = function() {
    console.log('=== 开始初始化统计页面 ===');
    console.log('用户管理器状态:', userManager);
    console.log('当前用户:', userManager.getCurrentUser());
    console.log('是否管理员:', userManager.isAdmin());

    // 根据用户权限加载不同的统计内容
    if (userManager.isAdmin()) {
        console.log('>>> 加载管理员统计视图');
        // 管理员：加载全部车辆统计
        loadStatistics();
        bindEventListeners();
    } else {
        console.log('>>> 加载普通用户统计视图');
        // 普通用户：加载个人统计
        loadPersonalStatistics();
    }
};

// 加载普通用户的个人统计
async function loadPersonalStatistics() {
    try {
        const currentUser = userManager.getCurrentUser();

        if (!currentUser) {
            showNoUserMessage();
            return;
        }

        const bookings = await dataManager.getAllBookings();
        const vehicles = await dataManager.getAllVehicles();

        // 筛选出当前用户已还车的记录（兼容两种字段名格式）
        const myReturnedBookings = bookings.filter(b => {
            const personName = b[FIELD_NAMES.person] || b.person;
            return personName === currentUser && b.returned === true;
        });

        if (myReturnedBookings.length === 0) {
            showNoReturnedBookings(currentUser);
            return;
        }

        // 计算个人统计数据
        const personalStats = calculatePersonalStats(myReturnedBookings, vehicles);

        // 渲染个人统计页面
        renderPersonalStatistics(currentUser, personalStats, myReturnedBookings, vehicles);

    } catch (error) {
        console.error('加载个人统计数据失败:', error);
        showErrorMessage();
    }
}

// 计算个人统计数据
function calculatePersonalStats(bookings, vehicles) {
    let totalHours = 0;
    const usedVehicles = new Set();

    bookings.forEach(booking => {
        const startTime = new Date(booking[FIELD_NAMES.startTime]);
        const endTime = new Date(booking[FIELD_NAMES.endTime]);
        const duration = (endTime - startTime) / (1000 * 60 * 60);

        totalHours += duration;
        usedVehicles.add(booking.vehicleId);
    });

    return {
        totalReturns: bookings.length,
        totalHours: totalHours.toFixed(1),
        vehicleCount: usedVehicles.size,
        avgHoursPerUse: (totalHours / bookings.length).toFixed(1)
    };
}

// 渲染个人统计页面
function renderPersonalStatistics(userName, stats, bookings, vehicles) {
    const container = document.querySelector('.container');

    // 隐藏清除按钮
    const clearBtn = document.getElementById('clearStatsBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    // 更新页面标题
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = `我的使用统计`;
    }

    // 更新统计卡片
    document.getElementById('totalVehicles').textContent = stats.vehicleCount;
    document.getElementById('totalUsages').textContent = stats.totalReturns;
    document.getElementById('totalHours').textContent = stats.totalHours;
    document.getElementById('totalUsers').textContent = '1';

    // 修改卡片标签
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 4) {
        statLabels[0].textContent = '使用车辆数';
        statLabels[1].textContent = '使用次数';
        statLabels[2].textContent = '总使用时长(小时)';
        statLabels[3].textContent = '平均时长(小时)';
    }

    // 更新平均时长
    document.getElementById('totalUsers').textContent = stats.avgHoursPerUse;

    // 隐藏月度分析，显示个人记录
    const monthlySection = document.querySelector('.monthly-analysis-section');
    if (monthlySection) {
        monthlySection.innerHTML = `
            <h2 style="margin-bottom: 20px;">📋 我的还车记录</h2>
            <div id="personalRecordsTable"></div>
        `;
    }

    // 渲染个人还车记录
    renderPersonalRecords(bookings, vehicles);

    // 隐藏空状态
    document.getElementById('emptyState').classList.add('hidden');
}

// 渲染个人还车记录表格
function renderPersonalRecords(bookings, vehicles) {
    const tableContainer = document.getElementById('personalRecordsTable');
    if (!tableContainer) return;

    // 按还车时间降序排序
    bookings.sort((a, b) => new Date(b.returnedAt) - new Date(a.returnedAt));

    const tableHTML = `
        <table class="monthly-table">
            <thead>
                <tr>
                    <th>序号</th>
                    <th>车辆</th>
                    <th>申请原因</th>
                    <th>开始时间</th>
                    <th>结束时间</th>
                    <th>使用时长</th>
                    <th>还车时间</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map((booking, index) => {
                    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                    const vehicleName = vehicle ? (vehicle[FIELD_NAMES.model] || vehicle[FIELD_NAMES.vehicle]) : '未知车辆';
                    const vehicleImage = vehicle ? vehicle.image : 'images/default.jpg';

                    const startTime = new Date(booking[FIELD_NAMES.startTime]);
                    const endTime = new Date(booking[FIELD_NAMES.endTime]);
                    const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);

                    return `
                        <tr>
                            <td class="rank-cell">${index + 1}</td>
                            <td class="vehicle-name-cell">
                                <div class="vehicle-info-inline">
                                    <img src="${vehicleImage}"
                                         alt="${vehicleName}"
                                         class="vehicle-thumb"
                                         onerror="this.style.display='none';">
                                    <span>${vehicleName}</span>
                                </div>
                            </td>
                            <td class="history-reason">${booking[FIELD_NAMES.reason]}</td>
                            <td>${formatDateTime(booking[FIELD_NAMES.startTime])}</td>
                            <td>${formatDateTime(booking[FIELD_NAMES.endTime])}</td>
                            <td class="number-cell">${duration}小时</td>
                            <td>${formatDateTime(booking.returnedAt)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

// 显示无用户信息提示
function showNoUserMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <div style="font-size: 80px; margin-bottom: 20px;">👤</div>
            <h2 style="color: #666; margin-bottom: 15px;">未找到用户信息</h2>
            <p style="color: #999; font-size: 16px;">请先完成用户设置</p>
            <a href="index.html" class="view-detail-btn" style="max-width: 200px; margin: 30px auto; display: block; text-decoration: none;">返回首页</a>
        </div>
    `;
}

// 显示无还车记录提示
function showNoReturnedBookings(userName) {
    const container = document.querySelector('.container');

    // 隐藏清除按钮
    const clearBtn = document.getElementById('clearStatsBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    // 隐藏统计卡片
    const statsOverview = document.querySelector('.stats-overview');
    if (statsOverview) statsOverview.style.display = 'none';

    // 隐藏月度分析
    const monthlySection = document.querySelector('.monthly-analysis-section');
    if (monthlySection) monthlySection.style.display = 'none';

    // 显示空状态
    const emptyState = document.getElementById('emptyState');
    emptyState.innerHTML = `
        <h2 style="color: #999;">暂无还车记录</h2>
        <p style="color: #666;">${userName}，您还没有已还车的记录</p>
        <a href="my-bookings.html" class="view-detail-btn" style="max-width: 200px; margin: 20px auto; display: block;">查看我的预定</a>
    `;
    emptyState.classList.remove('hidden');
}

// 显示错误信息
function showErrorMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div style="text-align: center; padding: 100px 20px;">
            <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
            <h2 style="color: #666; margin-bottom: 15px;">加载失败</h2>
            <p style="color: #999; font-size: 16px;">无法加载统计数据，请稍后重试</p>
            <button onclick="location.reload()" class="view-detail-btn" style="max-width: 200px; margin: 30px auto; display: block;">刷新页面</button>
        </div>
    `;
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
    const emptyState = document.getElementById('emptyState');

    // 检查是否有使用数据
    const hasUsage = statistics.some(stat => stat.totalUsages > 0);

    if (!hasUsage) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // 按使用次数降序排序
    statistics.sort((a, b) => b.totalUsages - a.totalUsages);

    // 只渲染月度使用率分析表
    renderMonthlyUtilizationTable(statistics);
}

// 渲染月度使用率分析表
function renderMonthlyUtilizationTable(statistics) {
    const monthlyContainer = document.getElementById('monthlyUtilizationTable');
    if (!monthlyContainer) return;

    // 按利用率降序排序
    const sortedStats = [...statistics].sort((a, b) => b.utilization - a.utilization);

    const tableHTML = `
        <table class="monthly-table">
            <thead>
                <tr>
                    <th>排名</th>
                    <th>车辆名称</th>
                    <th>30天利用率</th>
                    <th>使用次数</th>
                    <th>总时长(小时)</th>
                    <th>利用率评级</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${sortedStats.map((stat, index) => {
                    const vehicle = stat.vehicle;
                    const hasData = stat.totalUsages > 0;

                    // 利用率评级
                    let rating = '未使用';
                    let ratingClass = 'rating-none';
                    if (stat.utilization >= 60) {
                        rating = '高';
                        ratingClass = 'rating-high';
                    } else if (stat.utilization >= 30) {
                        rating = '中';
                        ratingClass = 'rating-medium';
                    } else if (stat.utilization > 0) {
                        rating = '低';
                        ratingClass = 'rating-low';
                    }

                    // 利用率柱状图宽度
                    const barWidth = Math.min(stat.utilization, 100);

                    return `
                        <tr class="${!hasData ? 'no-usage-row' : ''}" data-vehicle-id="${vehicle.id}">
                            <td class="rank-cell">${index + 1}</td>
                            <td class="vehicle-name-cell">
                                <div class="vehicle-info-inline">
                                    <img src="${vehicle.image || 'images/default.jpg'}"
                                         alt="${vehicle.model || vehicle.vehicle}"
                                         class="vehicle-thumb"
                                         onerror="this.onerror=null; this.style.display='none';">
                                    <span>${vehicle.model || vehicle.vehicle}</span>
                                </div>
                            </td>
                            <td class="utilization-bar-cell">
                                <div class="utilization-bar-container">
                                    <div class="utilization-bar ${ratingClass}" style="width: ${barWidth}%"></div>
                                    <span class="utilization-text">${hasData ? stat.utilization + '%' : '0%'}</span>
                                </div>
                            </td>
                            <td class="number-cell">${hasData ? stat.totalUsages : '0'}</td>
                            <td class="number-cell">${hasData ? stat.totalHours.toFixed(1) : '0'}</td>
                            <td class="rating-cell">
                                <span class="rating-badge ${ratingClass}">${rating}</span>
                            </td>
                            <td class="action-cell">
                                ${hasData ? `<button class="btn-view-detail" onclick="toggleVehicleDetail('${vehicle.id}')">
                                    <span class="detail-icon">▼</span> 查看详情
                                </button>` : '-'}
                            </td>
                        </tr>
                        <tr class="detail-row" id="detail-${vehicle.id}" style="display: none;">
                            <td colspan="7">
                                <div class="detail-content">
                                    <div class="detail-loading">加载中...</div>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    monthlyContainer.innerHTML = tableHTML;
}

// 切换车辆详情显示
async function toggleVehicleDetail(vehicleId) {
    const detailRow = document.getElementById(`detail-${vehicleId}`);
    const detailContent = detailRow.querySelector('.detail-content');
    const mainRow = document.querySelector(`tr[data-vehicle-id="${vehicleId}"]`);
    const button = mainRow.querySelector('.btn-view-detail');
    const icon = button.querySelector('.detail-icon');

    // 如果已经展开，则收起
    if (detailRow.style.display !== 'none') {
        detailRow.style.display = 'none';
        icon.textContent = '▼';
        button.classList.remove('expanded');
        return;
    }

    // 展开并加载数据
    detailRow.style.display = 'table-row';
    icon.textContent = '▲';
    button.classList.add('expanded');

    // 如果已经加载过数据，直接显示
    if (detailContent.dataset.loaded === 'true') {
        return;
    }

    // 加载历史数据
    try {
        const bookings = await dataManager.getAllBookings();
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // 筛选该车辆最近30天的记录
        const vehicleBookings = bookings.filter(b => {
            const startTime = new Date(b[FIELD_NAMES.startTime]);
            return b.vehicleId === vehicleId && startTime >= thirtyDaysAgo;
        });

        if (vehicleBookings.length === 0) {
            detailContent.innerHTML = '<div class="no-history">该车辆最近30天暂无使用记录</div>';
            detailContent.dataset.loaded = 'true';
            return;
        }

        // 按开始时间降序排序（最新的在前）
        vehicleBookings.sort((a, b) => new Date(b[FIELD_NAMES.startTime]) - new Date(a[FIELD_NAMES.startTime]));

        // 渲染历史记录表格
        const historyHTML = `
            <h4 class="detail-title">最近30天使用记录（共 ${vehicleBookings.length} 次）</h4>
            <table class="history-table">
                <thead>
                    <tr>
                        <th>使用人</th>
                        <th>申请原因</th>
                        <th>开始时间</th>
                        <th>结束时间</th>
                        <th>使用时长</th>
                        <th>状态</th>
                        <th>还车时间</th>
                    </tr>
                </thead>
                <tbody>
                    ${vehicleBookings.map(booking => {
                        const startTime = new Date(booking[FIELD_NAMES.startTime]);
                        const endTime = new Date(booking[FIELD_NAMES.endTime]);
                        const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
                        const isReturned = booking.returned;

                        return `
                            <tr class="${isReturned ? 'history-returned' : 'history-active'}">
                                <td>${booking[FIELD_NAMES.person]}</td>
                                <td class="history-reason">${booking[FIELD_NAMES.reason]}</td>
                                <td>${formatDateTime(booking[FIELD_NAMES.startTime])}</td>
                                <td>${formatDateTime(booking[FIELD_NAMES.endTime])}</td>
                                <td class="number-cell">${duration}小时</td>
                                <td>
                                    <span class="status-badge ${isReturned ? 'status-returned' : 'status-active'}">
                                        ${isReturned ? '已还车' : '使用中'}
                                    </span>
                                </td>
                                <td>${isReturned ? formatDateTime(booking.returnedAt) : '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        detailContent.innerHTML = historyHTML;
        detailContent.dataset.loaded = 'true';

    } catch (error) {
        console.error('加载历史记录失败:', error);
        detailContent.innerHTML = '<div class="error-message">加载失败，请重试</div>';
    }
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

// ========== 数据导出功能 ==========

// 打开导出弹窗
window.openExportModal = function() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'flex';

    // 默认设置为最近一个月
    setDateRange('month');
};

// 关闭导出弹窗
window.closeExportModal = function() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'none';
};

// 设置日期范围
window.setDateRange = function(range) {
    const now = new Date();
    const endDate = formatDateInput(now);
    let startDate;

    switch(range) {
        case 'all':
            // 设置为一个很早的日期
            startDate = '2020-01-01';
            break;
        case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            startDate = formatDateInput(weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
            startDate = formatDateInput(monthAgo);
            break;
        case 'threeMonths':
            const threeMonthsAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
            startDate = formatDateInput(threeMonthsAgo);
            break;
        case 'year':
            const yearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
            startDate = formatDateInput(yearAgo);
            break;
        default:
            startDate = formatDateInput(new Date(now - 30 * 24 * 60 * 60 * 1000));
    }

    document.getElementById('exportStartDate').value = startDate;
    document.getElementById('exportEndDate').value = endDate;
};

// 格式化日期为input[type=date]格式
function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 执行导出
window.executeExport = async function() {
    const startDate = document.getElementById('exportStartDate').value;
    const endDate = document.getElementById('exportEndDate').value;

    if (!startDate || !endDate) {
        alert('请选择时间范围');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert('开始时间不能晚于结束时间');
        return;
    }

    // 获取选中的字段
    const fields = {
        person: document.getElementById('field_person').checked,
        vehicle: document.getElementById('field_vehicle').checked,
        reason: document.getElementById('field_reason').checked,
        startTime: document.getElementById('field_startTime').checked,
        endTime: document.getElementById('field_endTime').checked,
        duration: document.getElementById('field_duration').checked,
        status: document.getElementById('field_status').checked,
        returnTime: document.getElementById('field_returnTime').checked
    };

    // 检查是否至少选择了一个字段
    if (!Object.values(fields).some(v => v)) {
        alert('请至少选择一个导出字段');
        return;
    }

    try {
        // 获取数据
        const bookings = await dataManager.getAllBookings();
        const vehicles = await dataManager.getAllVehicles();

        // 筛选时间范围内的数据
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredBookings = bookings.filter(b => {
            const bookingStart = new Date(b[FIELD_NAMES.startTime]);
            return bookingStart >= start && bookingStart <= end;
        });

        if (filteredBookings.length === 0) {
            alert('所选时间范围内没有预定记录');
            return;
        }

        // 生成CSV
        const csv = generateCSV(filteredBookings, vehicles, fields);

        // 下载CSV文件
        downloadCSV(csv, `预定数据_${startDate}_${endDate}.csv`);

        // 关闭弹窗
        closeExportModal();

        alert(`成功导出 ${filteredBookings.length} 条记录`);

    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试');
    }
};

// 生成CSV内容
function generateCSV(bookings, vehicles, fields) {
    // 构建表头
    const headers = [];
    if (fields.person) headers.push('使用人');
    if (fields.vehicle) headers.push('车辆名称');
    if (fields.reason) headers.push('申请原因');
    if (fields.startTime) headers.push('开始时间');
    if (fields.endTime) headers.push('结束时间');
    if (fields.duration) headers.push('使用时长(小时)');
    if (fields.status) headers.push('状态');
    if (fields.returnTime) headers.push('还车时间');

    let csv = headers.join(',') + '\n';

    // 按开始时间排序
    bookings.sort((a, b) => new Date(a[FIELD_NAMES.startTime]) - new Date(b[FIELD_NAMES.startTime]));

    // 构建数据行
    bookings.forEach(booking => {
        const row = [];

        if (fields.person) {
            row.push(escapeCSV(booking[FIELD_NAMES.person]));
        }

        if (fields.vehicle) {
            const vehicle = vehicles.find(v => v.id === booking.vehicleId);
            const vehicleName = vehicle ? (vehicle[FIELD_NAMES.model] || vehicle[FIELD_NAMES.vehicle]) : '未知车辆';
            row.push(escapeCSV(vehicleName));
        }

        if (fields.reason) {
            row.push(escapeCSV(booking[FIELD_NAMES.reason]));
        }

        if (fields.startTime) {
            row.push(escapeCSV(formatDateTime(booking[FIELD_NAMES.startTime])));
        }

        if (fields.endTime) {
            row.push(escapeCSV(formatDateTime(booking[FIELD_NAMES.endTime])));
        }

        if (fields.duration) {
            const startTime = new Date(booking[FIELD_NAMES.startTime]);
            const endTime = new Date(booking[FIELD_NAMES.endTime]);
            const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
            row.push(duration);
        }

        if (fields.status) {
            row.push(booking.returned ? '已还车' : '使用中');
        }

        if (fields.returnTime) {
            row.push(booking.returned ? escapeCSV(formatDateTime(booking.returnedAt)) : '-');
        }

        csv += row.join(',') + '\n';
    });

    return csv;
}

// 转义CSV特殊字符
function escapeCSV(value) {
    if (value == null) return '';

    const str = String(value);

    // 如果包含逗号、引号或换行，需要用引号包裹并转义内部引号
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }

    return str;
}

// 下载CSV文件
function downloadCSV(content, filename) {
    // 添加BOM以支持Excel正确显示中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// 绑定导出按钮事件
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', openExportModal);
    }

    // 点击弹窗外部关闭
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeExportModal();
            }
        });
    }
});

