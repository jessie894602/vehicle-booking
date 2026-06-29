// JSONBin 配置（替换为您的）
// v20260416 - 更新车辆数据，同步4月15日CSV清单
const JSONBIN_API_KEY = '$2a$10$0.el1vGg3USJgC1Gtui4k.FbLS9R6XHKyqM6n7YS9HjQgm2trFXW.';  // 在 jsonbin.io 获取
const JSONBIN_BIN_ID = '699fd213d0ea881f40da7ef2';    // 创建 Bin 后获取

// 字段名定义（简单版本，用于预定功能）
const FIELD_NAMES = {
    reason: 'reason',
    model: 'model',
    code: 'code',
    city: 'city',
    vin: 'vin',
    series: 'series',
    vehicle: 'vehicle',
    stage: 'stage',
    startTime: 'startTime',
    endTime: 'endTime',
    person: 'person',
    color: 'color',
    plateNumber: 'plateNumber',
    location: 'location',
    keyLocation: 'keyLocation',
    version: 'version'
};

// 车辆数据版本（更新后修改此值可自动同步JSONBin中的车辆数据）
const VEHICLES_VERSION = '2026-04-15-v2';

// 真实车辆数据（来自产品部车辆管理清单-4月15日.csv）
const VEHICLES = [
    {
        id: 'VEH001', code: '765772', model: 'Model3-25焕新版', vehicle: 'Model3-25焕新版',
        color: '黑/白', plateNumber: '京ACV6773', keyLocation: '李放',
        location: '北京市', city: '北京市', vin: 'LRW3E7EKXSC495307',
        series: '特斯拉', stage: 'SOP', version: 'HW4.0 ；2026.2.11',
        image: 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=Model3'
    },
    {
        id: 'VEH002', code: '763702', model: 'I8 Ultra-25款', vehicle: 'I8 Ultra-25款',
        color: '黑深灰/小象灰', plateNumber: '', keyLocation: '刘洋',
        location: '常州市', city: '常州市', vin: 'HLX13B176S1200049',
        series: 'W02', stage: 'PPV', version: '',
        image: 'https://via.placeholder.com/400x300/6A4C93/ffffff?text=I8+Ultra'
    },
    {
        id: 'VEH003', code: '763520', model: 'MEGA Max-25款', vehicle: 'MEGA Max-25款',
        color: '爱马仕橙/科技绿', plateNumber: '', keyLocation: '贺永强',
        location: '北京市', city: '北京市', vin: 'HLX14B170S1996293',
        series: '理想MEGA', stage: 'EP2', version: '',
        image: 'https://via.placeholder.com/400x300/9B59B6/ffffff?text=MEGA+Max'
    },
    {
        id: 'VEH004', code: '766793', model: 'I8 Max-25款', vehicle: 'I8 Max-25款',
        color: '黑深灰/黑', plateNumber: '', keyLocation: '张理想',
        location: '北京市', city: '北京市', vin: 'HLX13B17XS1200085',
        series: '理想I8', stage: 'PP1', version: '',
        image: 'https://via.placeholder.com/400x300/1A237E/ffffff?text=I8+Max'
    },
    {
        id: 'VEH005', code: '521763', model: 'L7 Ultra-24款', vehicle: 'L7 Ultra-24款',
        color: '黑白/银色', plateNumber: '', keyLocation: '袁梓焜',
        location: '北京市', city: '北京市', vin: 'HLX33B123R1616504',
        series: '理想L7', stage: 'P', version: '',
        image: 'https://via.placeholder.com/400x300/6A4C93/ffffff?text=L7+Ultra'
    },
    {
        id: 'VEH006', code: '243799', model: 'L9 Max-22款', vehicle: 'L9 Max-22款',
        color: '橙色/灰色', plateNumber: '津AGM8725', keyLocation: '邓靖东',
        location: '北京市', city: '北京市', vin: 'LW433B126N1000633',
        series: '理想L9', stage: 'P', version: '',
        image: 'https://via.placeholder.com/400x300/C0CA33/ffffff?text=L9+Max'
    },
    {
        id: 'VEH007', code: '509697', model: '问界M7-24款四驱', vehicle: '问界M7-24款四驱',
        color: '白色/黑色', plateNumber: '京AFM9977', keyLocation: '郭文韬',
        location: '北京市', city: '北京市', vin: 'LM8F7E896RA003696',
        series: '问界', stage: 'SOP', version: 'ADS 4.1',
        image: 'https://via.placeholder.com/400x300/3498DB/ffffff?text=M7'
    },
    {
        id: 'VEH008', code: '498717', model: '小鹏G6-24款', vehicle: '小鹏G6-24款',
        color: '白色/银色', plateNumber: '京AC68509', keyLocation: '郭文韬',
        location: '北京市', city: '北京市', vin: 'L1NNSGHA8PB044391',
        series: '小鹏G6', stage: 'SOP', version: 'XOS 5.9.5',
        image: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=XPeng+G6'
    },
    {
        id: 'VEH009', code: '469021', model: 'L8 Pro-24款', vehicle: 'L8 Pro-24款',
        color: '黑色/黑色', plateNumber: '', keyLocation: '贺永强',
        location: '北京市', city: '北京市', vin: 'HLX33B121P1765281',
        series: '理想L8', stage: 'PPV1', version: '',
        image: 'https://via.placeholder.com/400x300/5D3A9B/ffffff?text=L8+Pro'
    },
    {
        id: 'VEH010', code: '374262', model: 'L8 Lite-22款', vehicle: 'L8 Lite-22款',
        color: '橙色/黑色', plateNumber: '', keyLocation: '黄迪',
        location: '北京市', city: '北京市', vin: 'LW433B127P1004659',
        series: '理想L8', stage: 'P', version: '',
        image: 'https://via.placeholder.com/400x300/FF7043/ffffff?text=L8+Lite'
    },
    {
        id: 'VEH011', code: '821455', model: 'I6-25款', vehicle: 'I6-25款',
        color: '灰棕/外星银', plateNumber: '冀AAE8891', keyLocation: '黄迪',
        location: '北京市', city: '北京市', vin: 'HLX12B152S1501872',
        series: '理想-i6', stage: 'P', version: '',
        image: 'https://via.placeholder.com/400x300/26A69A/ffffff?text=I6'
    },
    {
        id: 'VEH012', code: '388852', model: 'L7 Pro-23款', vehicle: 'L7 Pro-23款',
        color: '黑橙/灰色', plateNumber: '京AFJ4863', keyLocation: '刘雨霏',
        location: '北京市', city: '北京市', vin: 'LW433B12XP1605080',
        series: '理想L7', stage: 'SOP', version: '',
        image: 'https://via.placeholder.com/400x300/8E44AD/ffffff?text=L7+Pro'
    },
    {
        id: 'VEH013', code: '335496', model: 'L7 Pro-22款', vehicle: 'L7 Pro-22款',
        color: '黑橙/灰色', plateNumber: '', keyLocation: '安庆涵',
        location: '北京市', city: '北京市', vin: 'LW433B12XN1601155',
        series: '理想L7', stage: 'PP3', version: '',
        image: 'https://via.placeholder.com/400x300/9B59B6/ffffff?text=L7+2022'
    },
    {
        id: 'VEH014', code: '294947', model: 'L8 Max-22款', vehicle: 'L8 Max-22款',
        color: '米白/蓝', plateNumber: '', keyLocation: '王雨诺',
        location: '北京市', city: '北京市', vin: 'LW433B125N1002874',
        series: '理想L8', stage: 'P1', version: '',
        image: 'https://via.placeholder.com/400x300/AF69BD/ffffff?text=L8+Max'
    },
    {
        id: 'VEH015', code: '243800', model: 'L9 Max-22款', vehicle: 'L9 Max-22款',
        color: '橙色/灰色', plateNumber: '', keyLocation: '阎吉',
        location: '北京市', city: '北京市', vin: 'LW433B126N1000597',
        series: '理想L9', stage: 'P', version: '',
        image: 'https://via.placeholder.com/400x300/BA68C8/ffffff?text=L9+Max'
    },
    {
        id: 'VEH016', code: '65498', model: 'ONE-21款', vehicle: 'ONE-21款',
        color: '黑色/黑色', plateNumber: '', keyLocation: '林晋熙',
        location: '北京市', city: '北京市', vin: 'LW433B110M1005123',
        series: '理想ONE', stage: 'PPV1', version: '',
        image: 'https://via.placeholder.com/400x300/CE93D8/ffffff?text=ONE+2021'
    },
    {
        id: 'VEH017', code: '43548', model: 'Model 3-20款', vehicle: 'Model 3-20款',
        color: '黑色/灰色', plateNumber: '京AD15829', keyLocation: '张凯贺',
        location: '北京市', city: '北京市', vin: 'LRW3E7EAXLC020104',
        series: '特斯拉', stage: 'SOP', version: 'HW3.0',
        image: 'https://via.placeholder.com/400x300/2196F3/ffffff?text=Model+3'
    }
];

// 本地后端 API 封装（替代 JSONBin，解决公司内网访问问题）
const API_BASE = '';
const jsonbinAPI = {
    async get() {
        const response = await fetch(API_BASE + '/api/data');
        if (!response.ok) throw new Error('读取数据失败: ' + response.status);
        const data = await response.json();
        return data.record;
    },

    async update(data) {
        const response = await fetch(API_BASE + '/api/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('保存数据失败: ' + response.status);
    }
};

// 数据管理类（使用JSONBin）
class DataManager {
    constructor() {
        this.data = null;
    }

    async loadData() {
        if (!this.data) {
            this.data = await jsonbinAPI.get();
            // 确保数据结构正确
            if (!this.data.bookings) {
                this.data.bookings = [];
            }
            if (!this.data.deviceBindings) {
                this.data.deviceBindings = {};
            }
            // 车辆数据版本检查：版本变化时自动用最新数据覆盖JSONBin中的车辆
            if (this.data.vehiclesVersion !== VEHICLES_VERSION) {
                console.log('车辆数据版本更新，同步最新数据到JSONBin...');
                this.data.vehicles = VEHICLES;
                this.data.vehiclesVersion = VEHICLES_VERSION;
                await this.saveData();
                console.log('车辆数据同步完成');
            } else if (!this.data.vehicles) {
                this.data.vehicles = VEHICLES;
            }
        }
        return this.data;
    }

    async saveData() {
        await jsonbinAPI.update(this.data);
    }

    async getAllVehicles() {
        await this.loadData();
        return this.data.vehicles;
    }

    async getVehicleById(id) {
        const vehicles = await this.getAllVehicles();
        return vehicles.find(v => v.id === id);
    }

    async updateVehicle(vehicleId, updates) {
        await this.loadData();
        const vehicle = this.data.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            Object.assign(vehicle, updates);
            await this.saveData();
            return true;
        }
        return false;
    }

    async getAllBookings() {
        await this.loadData();
        return this.data.bookings;
    }

    async addBooking(booking) {
        await this.loadData();
        booking.id = 'BOOK' + Date.now();
        booking.createdAt = new Date().toISOString();
        booking.returned = false;
        this.data.bookings.push(booking);
        await this.saveData();
        return booking;
    }

    // 仅写入本地缓存，不等待网络请求（用于乐观更新）
    addBookingLocal(booking) {
        booking.id = 'BOOK' + Date.now();
        booking.createdAt = new Date().toISOString();
        booking.returned = false;
        this.data.bookings.push(booking);
        return booking;
    }

    async deleteBooking(bookingId) {
        await this.loadData();
        this.data.bookings = this.data.bookings.filter(b => b.id !== bookingId);
        await this.saveData();
        return true;
    }

    async returnVehicle(bookingId) {
        await this.loadData();
        const booking = this.data.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.returned = true;
            booking.returnedAt = new Date().toISOString();
            await this.saveData();
            return true;
        }
        return false;
    }

    async getBookingsByVehicleId(vehicleId) {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.vehicleId === vehicleId);
    }

    async checkTimeConflict(vehicleId, startTime, endTime) {
        const bookings = await this.getBookingsByVehicleId(vehicleId);
        const start = new Date(startTime);
        const end = new Date(endTime);

        for (const booking of bookings) {
            const bookingStart = new Date(booking[FIELD_NAMES.startTime]);
            const bookingEnd = new Date(booking[FIELD_NAMES.endTime]);
            if (start < bookingEnd && end > bookingStart) {
                return true;
            }
        }
        return false;
    }

    async isVehicleInUse(vehicleId) {
        const bookings = await this.getBookingsByVehicleId(vehicleId);

        // 只要有未还车的预定，就显示"使用中"
        for (const booking of bookings) {
            if (!booking.returned) {
                return { inUse: true, booking: booking };
            }
        }
        return { inUse: false, booking: null };
    }

    async getVehicleStatus(vehicleId) {
        const status = await this.isVehicleInUse(vehicleId);
        if (status.inUse) {
            return {
                status: 'in-use',
                label: '使用中',
                user: status.booking[FIELD_NAMES.person],
                endTime: status.booking[FIELD_NAMES.endTime]
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

    // 获取设备绑定的用户
    async getDeviceBinding(deviceId) {
        await this.loadData();
        return this.data.deviceBindings[deviceId] || null;
    }

    // 绑定设备和用户
    async bindDeviceToUser(deviceId, userName) {
        await this.loadData();
        this.data.deviceBindings[deviceId] = userName;
        await this.saveData();
        return true;
    }

    // 解绑设备（用于管理员功能）
    async unbindDevice(deviceId) {
        await this.loadData();
        delete this.data.deviceBindings[deviceId];
        await this.saveData();
        return true;
    }
}

const dataManager = new DataManager();
