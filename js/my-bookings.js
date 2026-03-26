// 我的预定页面 - JavaScript

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadMyBookings();
});

// 加载我的预定记录
async function loadMyBookings() {
    const loadingState = document.getElementById('loadingState');
    const bookingsContainer = document.getElementById('bookingsContainer');
    const emptyState = document.getElementById('emptyState');
    const userNameSpan = document.getElementById('userName');

    try {
        // 获取当前用户
        const currentUser = userManager.getCurrentUser();

        if (!currentUser) {
            showError('未找到用户信息，请返回首页');
            return;
        }

        // 检查是否是管理员
        const isAdmin = userManager.isAdmin();

        // 显示用户名（管理员带标识）
        const adminBadge = isAdmin ? ' <span class="admin-badge-inline">管理员</span>' : '';
        userNameSpan.innerHTML = `👤 ${currentUser}${adminBadge}`;

        // 获取所有预定记录
        const allBookings = await dataManager.getAllBookings();

        // 筛选预定记录：管理员看所有记录，普通用户只看自己的
        let myBookings;
        if (isAdmin) {
            myBookings = allBookings; // 管理员看所有记录
        } else {
            myBookings = allBookings.filter(b => b[FIELD_NAMES.person] === currentUser); // 普通用户只看自己的
        }

        // 隐藏加载状态
        loadingState.classList.add('hidden');

        if (myBookings.length === 0) {
            // 显示空状态
            emptyState.classList.remove('hidden');
            return;
        }

        // 分类预定记录 - 只显示进行中的预定
        const activeBookings = myBookings.filter(b => !b.returned);

        // 显示预定列表
        bookingsContainer.classList.remove('hidden');

        // 渲染进行中的预定
        await renderBookingsList('activeBookingsList', activeBookings, false, isAdmin);

    } catch (error) {
        console.error('加载预定记录失败:', error);
        loadingState.classList.add('hidden');
        showError('加载失败，请刷新页面重试');
    }
}

// 渲染预定列表
async function renderBookingsList(containerId, bookings, isCompleted, isAdmin) {
    const container = document.getElementById(containerId);

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-bookings" style="text-align: center; padding: 40px; color: #999;">
                ${isCompleted ? '暂无已完成的预定' : '暂无进行中的预定'}
            </div>
        `;
        return;
    }

    // 按预定开始时间排序（从近到远）
    bookings.sort((a, b) => new Date(a[FIELD_NAMES.startTime]) - new Date(b[FIELD_NAMES.startTime]));

    // 渲染表格式布局
    let tableHTML = `
        <table class="bookings-table">
            <thead>
                <tr>
                    ${isAdmin ? '<th>预定人</th>' : ''}
                    <th>车辆</th>
                    <th>申请原因</th>
                    <th>预定时间</th>
                    ${isCompleted ? '<th>还车时间</th>' : ''}
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const booking of bookings) {
        // 获取车辆信息
        const vehicle = await dataManager.getVehicleById(booking.vehicleId);
        const vehicleName = vehicle ? (vehicle.model || vehicle.vehicle) : '未知车辆';

        const startTime = formatDateTime(booking[FIELD_NAMES.startTime]);
        const endTime = formatDateTime(booking[FIELD_NAMES.endTime]);

        // 构建操作按钮
        let actionButton = '';
        if (!isCompleted) {
            actionButton = `<button class="btn-return-table" onclick="returnVehicle('${booking.id}')">还车</button>`;
        } else {
            actionButton = `<button class="btn-delete-table" onclick="deleteBooking('${booking.id}')">删除</button>`;
        }

        tableHTML += `
            <tr class="${isCompleted ? 'completed-row' : ''}">
                ${isAdmin ? `<td class="person-cell">${booking[FIELD_NAMES.person]}</td>` : ''}
                <td class="vehicle-cell">${vehicleName}</td>
                <td class="reason-cell">${booking[FIELD_NAMES.reason]}</td>
                <td class="time-cell">${startTime} → ${endTime}</td>
                ${isCompleted ? `<td class="returned-cell">${formatDateTime(booking.returnedAt)}</td>` : ''}
                <td class="action-cell">${actionButton}</td>
            </tr>
        `;
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// 还车
async function returnVehicle(bookingId) {
    const bookings = await dataManager.getAllBookings();
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        alert('未找到预定记录');
        return;
    }

    // 获取当前车辆位置
    const vehicle = await dataManager.getVehicleById(booking.vehicleId);
    const currentLocation = vehicle.location || vehicle.city || '';
    const currentKeyLocation = vehicle.keyLocation || '';

    // 提示用户输入还车位置
    const newLocation = prompt(`请输入还车位置（当前位置：${currentLocation}）:`, currentLocation);

    // 如果用户点击取消
    if (newLocation === null) {
        return;
    }

    // 验证输入
    if (newLocation.trim() === '') {
        alert('还车位置不能为空');
        return;
    }

    // 提示用户输入钥匙位置
    const newKeyLocation = prompt(`请输入钥匙位置（当前位置：${currentKeyLocation || '未设置'}）:`, currentKeyLocation);

    // 如果用户点击取消
    if (newKeyLocation === null) {
        return;
    }

    // 验证输入
    if (newKeyLocation.trim() === '') {
        alert('钥匙位置不能为空');
        return;
    }

    if (confirm(`确认还车吗？\n车辆位置：${newLocation.trim()}\n钥匙位置：${newKeyLocation.trim()}\n\n还车后预定记录将标记为已完成。`)) {
        // 更新车辆位置和钥匙位置
        const updateSuccess = await dataManager.updateVehicle(booking.vehicleId, {
            location: newLocation.trim(),
            keyLocation: newKeyLocation.trim()
        });

        if (!updateSuccess) {
            alert('更新车辆信息失败');
            return;
        }

        // 执行还车操作
        const success = await dataManager.returnVehicle(bookingId);
        if (success) {
            alert(`还车成功！\n车辆位置：${newLocation.trim()}\n钥匙位置：${newKeyLocation.trim()}`);
            // 刷新页面
            loadMyBookings();
        } else {
            alert('还车失败，请重试');
        }
    }
}

// 删除预定记录
async function deleteBooking(bookingId) {
    if (confirm('确认删除该预定记录吗？此操作不可恢复。')) {
        const success = await dataManager.deleteBooking(bookingId);
        if (success) {
            alert('删除成功！');
            // 刷新页面
            loadMyBookings();
        } else {
            alert('删除失败，请重试');
        }
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

// 显示错误
function showError(message) {
    const loadingState = document.getElementById('loadingState');
    loadingState.innerHTML = `
        <div class="alert alert-error" style="text-align: center;">
            ${message}
        </div>
    `;
}
