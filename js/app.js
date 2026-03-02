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
    const scheduleHeader = document.getElementById('scheduleHeader');

    try {
        // 获取所有车辆
        const vehicles = await dataManager.getAllVehicles();

        // 隐藏加载状态
        loadingState.classList.add('hidden');

        if (vehicles.length === 0) {
            // 显示空状态
            emptyState.classList.remove('hidden');
        } else {
            // 生成并显示时间表头（只显示一次）
            renderScheduleHeader(scheduleHeader);
            scheduleHeader.classList.remove('hidden');

            // 显示车辆网格
            vehiclesGrid.classList.remove('hidden');

            // 清空网格
            vehiclesGrid.innerHTML = '';

            // 渲染每个车辆卡片
            for (const vehicle of vehicles) {
                const card = await createVehicleCard(vehicle);
                vehiclesGrid.appendChild(card);
            }

            // 所有车辆渲染完成后，设置滚动同步
            setTimeout(() => {
                setupScrollSync();
            }, 100);
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

// 渲染时间表头（只渲染一次）
function renderScheduleHeader(headerElement) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    let headerHTML = '<div class="schedule-header-row">';
    headerHTML += '<div class="vehicle-name-placeholder">车辆</div>';
    headerHTML += '<div class="schedule-header-scroll-wrapper" id="headerScrollWrapper">';
    headerHTML += '<div class="schedule-days-container">';

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayLabel = i === 0 ? '今天' : dayNames[date.getDay()];
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

        headerHTML += `
            <div class="schedule-day-column-header">
                <div class="day-label">${dayLabel}</div>
                <div class="date-label">${dateLabel}</div>
            </div>
        `;
    }

    headerHTML += '</div>';
    headerHTML += '</div>';
    headerHTML += '<div class="action-placeholder">操作</div>';
    headerHTML += '</div>';

    headerElement.innerHTML = headerHTML;
}

// 创建车辆卡片元素（新版：横向布局+7天预定进度条，无日期标题）
async function createVehicleCard(vehicle) {
    const row = document.createElement('div');
    row.className = 'vehicle-row';

    // 获取未来7天的预定情况
    const weekSchedule = await getWeekSchedule(vehicle.id);

    row.innerHTML = `
        <div class="vehicle-basic-info">
            <div class="vehicle-model-name">${vehicle.vehicle || vehicle.model || '-'}</div>
        </div>
        <div class="vehicle-schedule">
            <div class="schedule-days-container">
                ${weekSchedule.map(day => `
                    <div class="schedule-day-column-simple">
                        <div class="schedule-hours">
                            ${day.hours.map(hour => `
                                <div class="schedule-hour-cell ${hour.status}"
                                     title="${hour.tooltip}"
                                     data-status="${hour.status}"
                                     data-start="${hour.startTime}"
                                     data-end="${hour.endTime}"
                                     data-vehicle-id="${vehicle.id}">${hour.hour}</div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="vehicle-action">
            <button class="btn-book" data-vehicle-id="${vehicle.id}">预定</button>
        </div>
    `;

    // 为所有可用的小时格子添加点击和拖拽事件
    setTimeout(() => {
        const cells = row.querySelectorAll('.schedule-hour-cell.available');
        let isDragging = false;
        let dragStartCell = null;

        cells.forEach(cell => {
            cell.style.cursor = 'pointer';

            // 鼠标按下 - 开始拖拽
            cell.addEventListener('mousedown', function(e) {
                e.preventDefault();
                isDragging = true;
                dragStartCell = this;

                // 清除之前的选中
                cells.forEach(c => c.classList.remove('selected'));

                // 选中起始格子
                this.classList.add('selected');
            });

            // 鼠标移动 - 拖拽中
            cell.addEventListener('mouseenter', function() {
                if (isDragging && dragStartCell) {
                    // 清除所有选中
                    cells.forEach(c => c.classList.remove('selected'));

                    // 计算起始和结束的索引
                    const allCells = Array.from(cells);
                    const startIndex = allCells.indexOf(dragStartCell);
                    const endIndex = allCells.indexOf(this);

                    // 选中从起始到当前的所有格子
                    const minIndex = Math.min(startIndex, endIndex);
                    const maxIndex = Math.max(startIndex, endIndex);

                    for (let i = minIndex; i <= maxIndex; i++) {
                        allCells[i].classList.add('selected');
                    }
                }
            });

            // 单击事件（不拖拽时）
            cell.addEventListener('click', function(e) {
                if (!isDragging) {
                    toggleCellSelection(this, row);
                }
            });
        });

        // 鼠标松开 - 结束拖拽（在整个文档上监听）
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                dragStartCell = null;
            }
        });

        // 为预定按钮添加点击事件
        const bookBtn = row.querySelector('.btn-book');
        bookBtn.addEventListener('click', function() {
            const vehicleId = this.getAttribute('data-vehicle-id');
            handleBookingWithSelection(vehicleId, row);
        });
    }, 0);

    return row;
}

// 切换时间格子的选中状态
function toggleCellSelection(cell, row) {
    const isSelected = cell.classList.contains('selected');
    const allCells = Array.from(row.querySelectorAll('.schedule-hour-cell.available'));
    const selectedCells = Array.from(row.querySelectorAll('.schedule-hour-cell.selected'));

    if (isSelected) {
        // 取消选中
        cell.classList.remove('selected');
    } else {
        // 选中格子
        if (selectedCells.length === 0) {
            // 第一次选择，直接选中
            cell.classList.add('selected');
        } else {
            // 检查是否可以形成连续区间
            const currentIndex = allCells.indexOf(cell);
            const selectedIndices = selectedCells.map(c => allCells.indexOf(c));
            const minSelected = Math.min(...selectedIndices);
            const maxSelected = Math.max(...selectedIndices);

            if (currentIndex === minSelected - 1 || currentIndex === maxSelected + 1) {
                // 在选中区间的两端，可以扩展
                cell.classList.add('selected');
            } else if (currentIndex > minSelected && currentIndex < maxSelected) {
                // 在选中区间内部，可以选中
                cell.classList.add('selected');
            } else {
                // 不连续，清除之前的选择，重新开始
                selectedCells.forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
            }
        }
    }
}

// 处理带选中时间的预定
function handleBookingWithSelection(vehicleId, row) {
    const selectedCells = Array.from(row.querySelectorAll('.schedule-hour-cell.selected'));

    if (selectedCells.length === 0) {
        // 没有选中时间，直接跳转到预定页面
        navigateToDetail(vehicleId);
    } else {
        // 获取选中的时间范围
        const startTimes = selectedCells.map(cell => new Date(cell.getAttribute('data-start')));
        const endTimes = selectedCells.map(cell => new Date(cell.getAttribute('data-end')));

        const startTime = new Date(Math.min(...startTimes)).toISOString();
        const endTime = new Date(Math.max(...endTimes)).toISOString();

        // 清除选中状态
        selectedCells.forEach(cell => cell.classList.remove('selected'));

        // 跳转到预定页面并传递时间
        navigateToDetailWithTime(vehicleId, startTime, endTime);
    }
}

// 设置滚动同步
function setupScrollSync() {
    const headerScroll = document.getElementById('headerScrollWrapper');
    if (!headerScroll) return;

    let isScrolling = false;

    // 监听表头滚动，同步到所有车辆行
    headerScroll.addEventListener('scroll', function() {
        if (isScrolling) return;
        isScrolling = true;

        const scrollLeft = this.scrollLeft;
        const vehicleSchedules = document.querySelectorAll('.vehicle-schedule');

        vehicleSchedules.forEach(schedule => {
            schedule.scrollLeft = scrollLeft;
        });

        requestAnimationFrame(() => {
            isScrolling = false;
        });
    });

    // 监听任意车辆行滚动，同步到表头和其他行
    const vehicleSchedules = document.querySelectorAll('.vehicle-schedule');
    vehicleSchedules.forEach(schedule => {
        schedule.addEventListener('scroll', function() {
            if (isScrolling) return;
            isScrolling = true;

            const scrollLeft = this.scrollLeft;
            headerScroll.scrollLeft = scrollLeft;

            vehicleSchedules.forEach(otherSchedule => {
                if (otherSchedule !== this) {
                    otherSchedule.scrollLeft = scrollLeft;
                }
            });

            requestAnimationFrame(() => {
                isScrolling = false;
            });
        });
    });
}

// 获取未来7天的预定情况（按小时拆分：9:00-18:00）
async function getWeekSchedule(vehicleId) {
    const bookings = await dataManager.getBookingsByVehicleId(vehicleId);
    const schedule = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 工作时间：9:00-18:00，共10个小时
    const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dayLabel = i === 0 ? '今天' : dayNames[date.getDay()];
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

        // 为每个小时创建格子
        const hours = workHours.map(hour => {
            const hourStart = new Date(date);
            hourStart.setHours(hour, 0, 0, 0);
            const hourEnd = new Date(date);
            hourEnd.setHours(hour + 1, 0, 0, 0);

            let status = 'available';
            let tooltip = `${dateLabel} ${hour}:00-${hour + 1}:00 可预定`;

            // 检查这个小时是否被预定
            for (const booking of bookings) {
                if (booking.returned) continue;

                const bookingStart = new Date(booking.startTime);
                const bookingEnd = new Date(booking.endTime);

                // 判断预定时间是否覆盖这个小时
                if (bookingStart < hourEnd && bookingEnd > hourStart) {
                    status = 'booked';
                    tooltip = `${dateLabel} ${hour}:00-${hour + 1}:00 已预定\n预定人: ${booking.person}`;
                    break;
                }
            }

            return {
                hour: hour,
                status: status,
                tooltip: tooltip,
                startTime: hourStart.toISOString(),
                endTime: hourEnd.toISOString()
            };
        });

        schedule.push({
            dayLabel,
            dateLabel,
            hours
        });
    }

    return schedule;
}

// 导航到详情页
function navigateToDetail(vehicleId) {
    window.location.href = `detail.html?id=${vehicleId}`;
}

// 导航到详情页并预填充时间
function navigateToDetailWithTime(vehicleId, startTime, endTime) {
    window.location.href = `detail.html?id=${vehicleId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
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
