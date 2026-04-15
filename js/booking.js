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

    // 设置默认时间
    setDefaultDateTime();
}

// 自动填充用户姓名（飞书集成）
async function autoFillUserName() {
    const personInput = document.getElementById('person');
    if (!personInput) return;

    // 获取当前用户姓名
    const currentUser = userManager.getCurrentUser();

    if (currentUser) {
        // 填充当前用户姓名
        personInput.value = currentUser;

        // 禁用输入框（不允许修改）
        personInput.disabled = true;
        personInput.style.backgroundColor = '#f0f0f0';
        personInput.style.cursor = 'not-allowed';

        // 添加提示标签
        addAutoFillLabel(personInput, `已自动填充当前登录用户：${currentUser}`);

        console.log('已自动填充当前用户姓名:', currentUser);
    } else {
        console.log('未找到当前用户信息');
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
        document.getElementById('vehicleLocation').textContent = vehicle.location || vehicle.city || '-';
        document.getElementById('vehicleStageDetail').textContent = vehicle.stage || '-';
        document.getElementById('vehicleVersion').textContent = vehicle.version || '-';
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

    // 只显示未还车的预定记录
    const activeBookings = bookings.filter(b => !b.returned);

    if (activeBookings.length === 0) {
        historyList.innerHTML = '<div class="no-bookings">暂无进行中的预定</div>';
    } else {
        // 按开始时间排序（最近的在前）
        activeBookings.sort((a, b) => new Date(a[FIELD_NAMES.startTime]) - new Date(b[FIELD_NAMES.startTime]));

        // 精简显示：一行展示姓名、预定时间、申请原因
        const bookingsHTML = activeBookings.map(booking => {
            const startTime = formatDateTime(booking[FIELD_NAMES.startTime]);
            const endTime = formatDateTime(booking[FIELD_NAMES.endTime]);

            return `
                <div class="booking-history-item-simple">
                    <span class="booking-person-simple">👤 ${booking[FIELD_NAMES.person]}</span>
                    <span class="booking-time-simple">📅 ${startTime} → ${endTime}</span>
                    <span class="booking-reason-simple">${booking[FIELD_NAMES.reason]}</span>
                </div>
            `;
        }).join('');

        historyList.innerHTML = bookingsHTML;
    }

    // 显示历史记录容器
    historyContainer.classList.remove('hidden');
}

// 还车功能已取消（在detail.html页面不提供还车功能，请使用"我的预定"页面还车）
// async function returnVehicle(bookingId) {
//     ... 已注释
// }

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
        // 先检查URL参数中是否有时间
        const urlStartTime = getUrlParameter('startTime');
        const urlEndTime = getUrlParameter('endTime');

        if (urlStartTime && urlEndTime) {
            // 使用URL传递的时间
            const start = new Date(urlStartTime);
            const end = new Date(urlEndTime);

            startTimeInput.value = formatDateTimeForInput(start);
            endTimeInput.value = formatDateTimeForInput(end);

            // 高亮显示，提示用户这是预选的时间
            startTimeInput.style.backgroundColor = '#e3f2fd';
            endTimeInput.style.backgroundColor = '#e3f2fd';
        } else {
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

    const submitBtn = document.querySelector('#bookingForm .submit-btn');

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

    // 禁用按钮，防止重复提交
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
    }

    // 检查时间冲突
    const hasConflict = await dataManager.checkTimeConflict(
        currentVehicle.id,
        formData.startTime,
        formData.endTime
    );

    if (hasConflict) {
        showAlert('所选时间段与其他预定冲突，请重新选择时间', 'warning');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交预定';
        }
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
        // 立即写入本地缓存，不等待网络（乐观更新）
        const savedBooking = dataManager.addBookingLocal(booking);

        // 立即刷新预定历史（使用本地缓存，无需等待网络）
        await loadBookingHistory(currentVehicle.id);

        // 立即显示成功消息
        showAlert('预定成功！3秒后返回车辆列表...', 'success');

        // 清空表单
        document.getElementById('bookingForm').reset();

        // 重新设置默认时间
        setDefaultDateTime();

        // 重新填充用户姓名（因为reset会清空）
        await autoFillUserName();

        // 后台异步保存到 JSONBin，不阻塞用户
        dataManager.saveData().catch(error => {
            console.error('后台保存失败:', error);
        });

        // 3秒后跳转到首页并显示提示
        setTimeout(() => {
            window.location.href = `index.html?bookingSuccess=true&vehicle=${encodeURIComponent(currentVehicle.model || currentVehicle.vehicle)}`;
        }, 3000);

    } catch (error) {
        console.error('预定失败:', error);
        showAlert('预定失败，请重试', 'error');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交预定';
        }
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
