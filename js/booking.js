// 车辆预定系统 - 预定功能模块

let currentVehicle = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeDetailPage();
});

// 初始化详情页
async function initializeDetailPage() {
    // 从URL获取车辆ID
    const vehicleId = getUrlParameter('id');

    if (!vehicleId) {
        showNotFound();
        return;
    }

    // 尝试自动填充用户姓名（飞书集成）
    await autoFillUserName();

    // 加载车辆详情
    loadVehicleDetail(vehicleId);

    // 绑定表单提交事件
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // 绑定我的预定链接
    const myBookingsLink = document.getElementById('myBookingsLink');
    if (myBookingsLink) {
        myBookingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMyBookings();
        });
    }

    // 设置默认时间
    setDefaultDateTime();
}

// 自动填充用户姓名（飞书集成）
async function autoFillUserName() {
    const personInput = document.getElementById('person');
    if (!personInput) return;

    try {
        // 检测是否在飞书环境中
        if (feishuIntegration.isFeishuEnv) {
            console.log('检测到飞书环境，尝试获取用户信息...');

            // 尝试从飞书获取用户信息
            const userInfo = await feishuIntegration.getUserInfo();

            if (userInfo && userInfo.name) {
                personInput.value = userInfo.name;
                personInput.style.backgroundColor = '#e3f2fd';
                console.log('已自动填充飞书用户姓名:', userInfo.name);

                // 添加提示标签
                addAutoFillLabel(personInput, '已自动获取飞书用户信息');
                return;
            }
        }

        // 如果不在飞书环境或获取失败，使用本地保存的姓名
        const savedName = feishuIntegration.getSavedUserInfo();
        if (savedName) {
            personInput.value = savedName;
            personInput.style.backgroundColor = '#fff9c4';
            console.log('已自动填充上次使用的姓名:', savedName);

            // 添加提示标签
            addAutoFillLabel(personInput, '已自动填充上次使用的姓名');
        }

    } catch (error) {
        console.error('自动填充用户姓名失败:', error);
    }
}

// 添加自动填充提示标签
function addAutoFillLabel(inputElement, message) {
    const existingLabel = inputElement.parentElement.querySelector('.auto-fill-hint');
    if (existingLabel) {
        existingLabel.remove();
    }

    const hint = document.createElement('div');
    hint.className = 'auto-fill-hint';
    hint.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px;';
    hint.innerHTML = `✓ ${message}`;
    inputElement.parentElement.appendChild(hint);
}

// 加载车辆详情
async function loadVehicleDetail(vehicleId) {
    const loadingState = document.getElementById('loadingState');
    const vehicleDetailCard = document.getElementById('vehicleDetailCard');
    const bookingFormContainer = document.getElementById('bookingFormContainer');
    const notFoundState = document.getElementById('notFoundState');

    try {
        // 获取车辆信息
        const vehicle = await dataManager.getVehicleById(vehicleId);

        // 调试：在控制台打印获取到的车辆数据
        console.log('===== 车辆数据 =====');
        console.log('完整vehicle对象:', vehicle);
        console.log('vehicle.model:', vehicle.model);
        console.log('vehicle.vehicle:', vehicle.vehicle);
        console.log('vehicle.location:', vehicle.location);
        console.log('vehicle.city:', vehicle.city);
        console.log('vehicle.stage:', vehicle.stage);
        console.log('vehicle.color:', vehicle.color);
        console.log('vehicle.plateNumber:', vehicle.plateNumber);
        console.log('==================');

        loadingState.classList.add('hidden');

        if (!vehicle) {
            showNotFound();
            return;
        }

        // 保存当前车辆
        currentVehicle = vehicle;

        // 显示车辆详情和预定表单
        vehicleDetailCard.classList.remove('hidden');
        bookingFormContainer.classList.remove('hidden');

        // 填充车辆信息
        document.getElementById('vehicleModel').textContent = vehicle.model || vehicle.vehicle || '-';
        document.getElementById('vehicleStage').textContent = vehicle.stage || '-';
        document.getElementById('vehicleImage').src = vehicle.image || '';
        document.getElementById('vehicleImage').alt = vehicle.model || '车辆图片';
        document.getElementById('vehicleCode').textContent = vehicle.code || '-';
        document.getElementById('vehicleVin').textContent = vehicle.vin || '-';
        document.getElementById('vehicleVehicle').textContent = vehicle.vehicle || '-';
        document.getElementById('vehicleLocation').textContent = vehicle.location || vehicle.city || '-';
        document.getElementById('vehicleStageDetail').textContent = vehicle.stage || '-';
        document.getElementById('vehicleColor').textContent = vehicle.color || '-';
        document.getElementById('vehiclePlateNumber').textContent = vehicle.plateNumber || '暂无车牌';
        document.getElementById('vehicleKeyLocation').textContent = vehicle.keyLocation || '未设置';

        // 加载预定历史记录
        await loadBookingHistory(vehicleId);

    } catch (error) {
        console.error('加载车辆详情失败:', error);
        loadingState.classList.add('hidden');
        showNotFound();
    }
}

// 加载预定历史记录
async function loadBookingHistory(vehicleId) {
    const historyContainer = document.getElementById('bookingHistoryContainer');
    const historyList = document.getElementById('bookingHistoryList');

    if (!historyContainer || !historyList) return;

    // 获取该车辆的所有预定记录
    const bookings = await dataManager.getBookingsByVehicleId(vehicleId);

    if (bookings.length === 0) {
        historyList.innerHTML = '<div class="no-bookings">暂无预定记录</div>';
    } else {
        // 按创建时间倒序排列（最新的在前）
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 添加控制按钮
        const controlsHTML = `
            <div class="history-controls">
                <button class="btn-clear-returned" onclick="clearReturnedBookings()">清除已还车记录</button>
                <button class="btn-clear" onclick="clearAllBookingsConfirm()">清除所有记录</button>
            </div>
        `;

        const bookingsHTML = bookings.map(booking => {
            const returnedClass = booking.returned ? 'returned' : '';
            const returnedBadge = booking.returned
                ? `<div class="returned-badge">✓ 已还车 ${formatDateTime(booking.returnedAt)}</div>`
                : '';

            const actionButtons = booking.returned
                ? `<div class="booking-actions">
                       <button class="btn-delete" onclick="deleteBooking('${booking.id}')">删除记录</button>
                   </div>`
                : `<div class="booking-actions">
                       <button class="btn-return" onclick="returnVehicle('${booking.id}')">还车</button>
                       <button class="btn-delete" onclick="deleteBooking('${booking.id}')">删除</button>
                   </div>`;

            return `
                <div class="booking-history-item ${returnedClass}">
                    <div class="booking-history-header">
                        <span class="booking-person">👤 ${booking[FIELD_NAMES.person]}</span>
                        <span class="booking-date">预定于 ${formatDateTime(booking.createdAt)}</span>
                    </div>
                    <div class="booking-time-range">
                        <span class="time-badge">📅 ${formatDateTime(booking[FIELD_NAMES.startTime])}</span>
                        <span class="time-arrow">→</span>
                        <span class="time-badge">📅 ${formatDateTime(booking[FIELD_NAMES.endTime])}</span>
                    </div>
                    <div class="booking-reason">
                        <strong>申请原因：</strong>${booking[FIELD_NAMES.reason]}
                    </div>
                    ${returnedBadge}
                    ${actionButtons}
                </div>
            `;
        }).join('');

        historyList.innerHTML = controlsHTML + bookingsHTML;
    }

    // 显示历史记录容器
    historyContainer.classList.remove('hidden');
}

// 还车
async function returnVehicle(bookingId) {
    const bookings = await dataManager.getAllBookings();
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        showAlert('未找到预定记录', 'error');
        return;
    }

    // 获取当前车辆位置
    const vehicle = await dataManager.getVehicleById(booking.vehicleId);
    const currentLocation = vehicle.location || vehicle.city || '';
    const currentKeyLocation = vehicle.keyLocation || '';

    // 提示用户输入还车位置
    const newLocation = prompt(`请输入还车位置（当前位置：${currentLocation}）:`, currentLocation);

    // 如果用户点击取消，则不执行还车
    if (newLocation === null) {
        return;
    }

    // 如果用户输入为空，提示错误
    if (newLocation.trim() === '') {
        showAlert('还车位置不能为空', 'error');
        return;
    }

    // 提示用户输入钥匙位置
    const newKeyLocation = prompt(`请输入钥匙位置（当前位置：${currentKeyLocation || '未设置'}）:`, currentKeyLocation);

    // 如果用户点击取消，则不执行还车
    if (newKeyLocation === null) {
        return;
    }

    // 如果用户输入为空，提示错误
    if (newKeyLocation.trim() === '') {
        showAlert('钥匙位置不能为空', 'error');
        return;
    }

    if (confirm(`确认还车吗？\n车辆位置：${newLocation.trim()}\n钥匙位置：${newKeyLocation.trim()}\n\n还车后预定记录将被删除，但会保存到使用统计中。`)) {
        // 更新车辆位置和钥匙位置
        const updateSuccess = await dataManager.updateVehicle(booking.vehicleId, {
            location: newLocation.trim(),
            keyLocation: newKeyLocation.trim()
        });

        if (!updateSuccess) {
            showAlert('更新车辆信息失败', 'error');
            return;
        }

        // 执行还车操作
        const success = await dataManager.returnVehicle(bookingId);
        if (success) {
            // 更新当前车辆信息（如果还在详情页）
            if (currentVehicle && currentVehicle.id === booking.vehicleId) {
                currentVehicle.location = newLocation.trim();
                currentVehicle.keyLocation = newKeyLocation.trim();
                // 更新页面显示
                document.getElementById('vehicleLocation').textContent = newLocation.trim();
                document.getElementById('vehicleKeyLocation').textContent = newKeyLocation.trim();
            }

            // 刷新历史记录
            await loadBookingHistory(booking.vehicleId);
            showAlert(`还车成功！\n车辆位置：${newLocation.trim()}\n钥匙位置：${newKeyLocation.trim()}`, 'success');
        } else {
            showAlert('还车失败，请重试', 'error');
        }
    }
}

// 删除预定记录
function deleteBooking(bookingId) {
    if (confirm('确认删除该预定记录吗？此操作不可恢复。')) {
        const success = dataManager.deleteBooking(bookingId);
        if (success) {
            // 刷新历史记录
            loadBookingHistory(currentVehicle.id);
            showAlert('删除成功！', 'success');
        } else {
            showAlert('删除失败，请重试', 'error');
        }
    }
}

// 清除已还车的记录
function clearReturnedBookings() {
    if (confirm('确认清除所有已还车的记录吗？此操作不可恢复。')) {
        const success = dataManager.clearReturnedBookings();
        if (success) {
            // 刷新历史记录
            loadBookingHistory(currentVehicle.id);
            showAlert('已清除所有已还车记录！', 'success');
        } else {
            showAlert('清除失败，请重试', 'error');
        }
    }
}

// 清除所有记录（带确认）
function clearAllBookingsConfirm() {
    if (confirm('警告：确认清除所有预定记录吗？包括未还车的记录。此操作不可恢复！')) {
        if (confirm('再次确认：您真的要删除所有预定记录吗？')) {
            const success = dataManager.clearAllBookings();
            if (success) {
                // 刷新历史记录
                loadBookingHistory(currentVehicle.id);
                showAlert('已清除所有预定记录！', 'success');
            } else {
                showAlert('清除失败，请重试', 'error');
            }
        }
    }
}

// 设置默认日期时间
function setDefaultDateTime() {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');

    if (startTimeInput && endTimeInput) {
        // 设置开始时间为当前时间的下一个整点
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        now.setSeconds(0);

        // 设置结束时间为开始时间后2小时
        const end = new Date(now);
        end.setHours(end.getHours() + 2);

        startTimeInput.value = formatDateTimeForInput(now);
        endTimeInput.value = formatDateTimeForInput(end);
    }
}

// 格式化日期时间为input控件格式
function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 处理预定表单提交
async function handleBookingSubmit(e) {
    e.preventDefault();

    // 清除之前的提示
    hideAlert();

    // 获取表单数据
    const formData = {
        reason: document.getElementById('reason').value.trim(),
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        person: document.getElementById('person').value.trim()
    };

    // 验证表单
    const validation = validateBookingForm(formData);
    if (!validation.valid) {
        showAlert(validation.message, 'error');
        return;
    }

    // 检查时间冲突
    const hasConflict = await dataManager.checkTimeConflict(
        currentVehicle.id,
        formData.startTime,
        formData.endTime
    );

    if (hasConflict) {
        showAlert('所选时间段与其他预定冲突，请重新选择时间', 'warning');
        return;
    }

    // 创建预定对象
    const booking = {
        vehicleId: currentVehicle.id,
        vehicleModel: currentVehicle.model || currentVehicle.vehicle,
        reason: formData.reason,
        startTime: formData.startTime,
        endTime: formData.endTime,
        person: formData.person
    };

    try {
        // 保存预定
        const savedBooking = await dataManager.addBooking(booking);

        // 保存用户姓名到本地，供下次自动填充
        feishuIntegration.saveUserInfo(formData.person);

        // 刷新预定历史记录
        await loadBookingHistory(currentVehicle.id);

        // 显示成功消息
        showAlert('预定成功！3秒后返回车辆列表...', 'success');

        // 清空表单
        document.getElementById('bookingForm').reset();

        // 重新设置默认时间
        setDefaultDateTime();

        // 3秒后跳转到首页并显示提示
        setTimeout(() => {
            window.location.href = `index.html?bookingSuccess=true&vehicle=${encodeURIComponent(currentVehicle.model || currentVehicle.vehicle)}`;
        }, 3000);

    } catch (error) {
        console.error('预定失败:', error);
        showAlert('预定失败，请重试', 'error');
    }
}

// 验证预定表单
function validateBookingForm(formData) {
    // 检查申请原因
    if (!formData.reason) {
        return {
            valid: false,
            message: '请输入申请原因'
        };
    }

    if (formData.reason.length < 5) {
        return {
            valid: false,
            message: '申请原因至少需要5个字符'
        };
    }

    // 检查开始时间
    if (!formData.startTime) {
        return {
            valid: false,
            message: '请选择开始时间'
        };
    }

    // 检查结束时间
    if (!formData.endTime) {
        return {
            valid: false,
            message: '请选择结束时间'
        };
    }

    // 检查时间范围
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();

    if (startTime < now) {
        return {
            valid: false,
            message: '开始时间不能早于当前时间'
        };
    }

    if (endTime <= startTime) {
        return {
            valid: false,
            message: '结束时间必须晚于开始时间'
        };
    }

    // 检查预定时长（不能超过30天）
    const duration = (endTime - startTime) / (1000 * 60 * 60 * 24);
    if (duration > 30) {
        return {
            valid: false,
            message: '预定时长不能超过30天'
        };
    }

    // 检查人员姓名
    if (!formData.person) {
        return {
            valid: false,
            message: '请输入申请人姓名'
        };
    }

    if (formData.person.length < 2) {
        return {
            valid: false,
            message: '申请人姓名至少需要2个字符'
        };
    }

    return {
        valid: true,
        message: ''
    };
}

// 显示提示消息
function showAlert(message, type = 'success') {
    const alertMessage = document.getElementById('alertMessage');
    if (!alertMessage) return;

    alertMessage.className = `alert alert-${type}`;
    alertMessage.textContent = message;
    alertMessage.classList.remove('hidden');

    // 滚动到提示位置
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 隐藏提示消息
function hideAlert() {
    const alertMessage = document.getElementById('alertMessage');
    if (alertMessage) {
        alertMessage.classList.add('hidden');
    }
}

// 显示未找到状态
function showNotFound() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('notFoundState').classList.remove('hidden');
}

// 显示错误
function showError(message) {
    const loadingState = document.getElementById('loadingState');
    loadingState.innerHTML = `
        <div class="alert alert-error">
            ${message}
        </div>
    `;
}

// 显示我的预定
async function showMyBookings() {
    try {
        // 获取当前用户姓名
        let currentUser = feishuIntegration.getSavedUserInfo();

        // 如果没有保存的姓名，提示用户输入
        if (!currentUser) {
            currentUser = prompt('请输入您的姓名以查看您的预定记录:');
            if (!currentUser || !currentUser.trim()) {
                return;
            }
            currentUser = currentUser.trim();
        }

        const bookings = await dataManager.getAllBookings();

        // 筛选出当前用户的预定记录
        const myBookings = bookings.filter(b => b.person === currentUser);

        if (!myBookings || myBookings.length === 0) {
            alert(`${currentUser}，您还没有任何预定记录`);
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

// 格式化日期时间显示
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
