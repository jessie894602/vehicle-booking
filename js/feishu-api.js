// 飞书API客户端配置
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'  // 本地开发
    : 'https://your-api-domain.com/api';  // 生产环境（部署后替换为实际域名）

// API请求封装
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || '请求失败');
        }

        return data.data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

// 飞书字段映射（将前端字段名映射到飞书多维表格字段名）
const FEISHU_FIELD_MAP = {
    // 车辆字段映射
    id: '车辆ID',
    code: '车辆编码',
    model: '车辆型号',
    series: '车系',
    vehicle: '车辆',
    location: '车辆位置',
    city: '车辆城市',
    vin: 'VIN码',
    stage: '车辆阶段',
    color: '内外饰颜色',
    plateNumber: '车牌号',
    image: '车辆图片',

    // 预定字段映射
    bookingId: '预定ID',
    vehicleId: '车辆ID',
    vehicleModel: '车辆型号',
    reason: '申请原因',
    startTime: '开始时间',
    endTime: '结束时间',
    person: '申请人',
    createdAt: '创建时间',
    status: '状态',
    returned: '是否已还车',
    returnedAt: '还车时间'
};

// 将前端对象转换为飞书字段格式
function toFeishuFields(obj, fieldMap = FEISHU_FIELD_MAP) {
    const feishuFields = {};
    for (const [key, value] of Object.entries(obj)) {
        const feishuKey = fieldMap[key] || key;
        feishuFields[feishuKey] = value;
    }
    return feishuFields;
}

// 将飞书记录转换为前端对象格式
function fromFeishuRecord(record, fieldMap = FEISHU_FIELD_MAP) {
    const obj = {
        _recordId: record.record_id  // 保存飞书记录ID用于更新和删除
    };

    const reverseMap = {};
    for (const [key, value] of Object.entries(fieldMap)) {
        reverseMap[value] = key;
    }

    for (const [feishuKey, value] of Object.entries(record.fields)) {
        const localKey = reverseMap[feishuKey] || feishuKey;
        obj[localKey] = value;
    }

    return obj;
}

// 数据管理类（集成飞书API）
class FeishuDataManager {
    constructor() {
        this.vehiclesCache = null;
        this.bookingsCache = null;
        this.cacheTime = 0;
        this.CACHE_DURATION = 30000; // 缓存30秒
    }

    // 检查缓存是否有效
    isCacheValid() {
        return Date.now() - this.cacheTime < this.CACHE_DURATION;
    }

    // ========== 车辆管理 ==========

    // 获取所有车辆
    async getAllVehicles(forceRefresh = false) {
        if (!forceRefresh && this.vehiclesCache && this.isCacheValid()) {
            return this.vehiclesCache;
        }

        try {
            const records = await apiRequest('/vehicles');
            this.vehiclesCache = records.map(record => fromFeishuRecord(record));
            this.cacheTime = Date.now();
            return this.vehiclesCache;
        } catch (error) {
            console.error('获取车辆列表失败:', error);
            // 如果有缓存，返回缓存数据
            if (this.vehiclesCache) {
                return this.vehiclesCache;
            }
            throw error;
        }
    }

    // 根据ID获取车辆
    async getVehicleById(id) {
        const vehicles = await this.getAllVehicles();
        return vehicles.find(v => v.id === id);
    }

    // 更新车辆信息
    async updateVehicle(vehicleId, updates) {
        try {
            // 先获取车辆找到recordId
            const vehicles = await this.getAllVehicles();
            const vehicle = vehicles.find(v => v.id === vehicleId);

            if (!vehicle || !vehicle._recordId) {
                throw new Error('车辆不存在');
            }

            const feishuFields = toFeishuFields(updates);
            await apiRequest(`/vehicles/${vehicle._recordId}`, {
                method: 'PUT',
                body: JSON.stringify(feishuFields)
            });

            // 刷新缓存
            await this.getAllVehicles(true);
            return true;
        } catch (error) {
            console.error('更新车辆失败:', error);
            throw error;
        }
    }

    // ========== 预定管理 ==========

    // 获取所有预定
    async getAllBookings(forceRefresh = false) {
        if (!forceRefresh && this.bookingsCache && this.isCacheValid()) {
            return this.bookingsCache;
        }

        try {
            const records = await apiRequest('/bookings');
            this.bookingsCache = records.map(record => fromFeishuRecord(record));
            return this.bookingsCache;
        } catch (error) {
            console.error('获取预定列表失败:', error);
            if (this.bookingsCache) {
                return this.bookingsCache;
            }
            throw error;
        }
    }

    // 添加预定
    async addBooking(booking) {
        try {
            booking.bookingId = 'BOOK' + Date.now();
            booking.createdAt = new Date().toISOString();
            booking.status = '待审批';
            booking.returned = false;
            booking.returnedAt = null;

            const feishuFields = toFeishuFields(booking);
            const record = await apiRequest('/bookings', {
                method: 'POST',
                body: JSON.stringify(feishuFields)
            });

            // 刷新缓存
            await this.getAllBookings(true);

            return fromFeishuRecord(record);
        } catch (error) {
            console.error('创建预定失败:', error);
            throw error;
        }
    }

    // 删除预定
    async deleteBooking(bookingId) {
        try {
            const bookings = await this.getAllBookings();
            const booking = bookings.find(b => b.bookingId === bookingId);

            if (!booking || !booking._recordId) {
                throw new Error('预定不存在');
            }

            await apiRequest(`/bookings/${booking._recordId}`, {
                method: 'DELETE'
            });

            // 刷新缓存
            await this.getAllBookings(true);
            return true;
        } catch (error) {
            console.error('删除预定失败:', error);
            throw error;
        }
    }

    // 还车（删除预定记录）
    async returnVehicle(bookingId) {
        // 飞书版本直接删除记录（或可以标记为已还车）
        return await this.deleteBooking(bookingId);
    }

    // 根据车辆ID获取预定
    async getBookingsByVehicleId(vehicleId) {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.vehicleId === vehicleId);
    }

    // 检查时间冲突
    async checkTimeConflict(vehicleId, startTime, endTime, excludeBookingId = null) {
        const bookings = await this.getBookingsByVehicleId(vehicleId);
        const start = new Date(startTime);
        const end = new Date(endTime);

        for (const booking of bookings) {
            if (excludeBookingId && booking.bookingId === excludeBookingId) {
                continue;
            }

            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);

            if (start < bookingEnd && end > bookingStart) {
                return true;
            }
        }
        return false;
    }

    // 检查车辆是否在使用中
    async isVehicleInUse(vehicleId) {
        const bookings = await this.getBookingsByVehicleId(vehicleId);
        const now = new Date();

        for (const booking of bookings) {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);

            if (now >= startTime && now <= endTime) {
                return {
                    inUse: true,
                    booking: booking
                };
            }
        }

        return {
            inUse: false,
            booking: null
        };
    }

    // 获取车辆状态
    async getVehicleStatus(vehicleId) {
        const status = await this.isVehicleInUse(vehicleId);

        if (status.inUse) {
            return {
                status: 'in-use',
                label: '使用中',
                user: status.booking.person,
                endTime: status.booking.endTime
            };
        } else {
            return {
                status: 'available',
                label: '空闲',
                user: null,
                endTime: null
            };
        }
    }

    // 清除所有缓存
    clearCache() {
        this.vehiclesCache = null;
        this.bookingsCache = null;
        this.cacheTime = 0;
    }
}

// 创建全局实例（兼容旧代码中的dataManager）
const dataManager = new FeishuDataManager();

// 导出（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dataManager, FeishuDataManager };
}
