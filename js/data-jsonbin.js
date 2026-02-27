// JSONBin 配置（替换为您的）
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
    keyLocation: 'keyLocation'
};

// JSONBin API 封装
const jsonbinAPI = {
    async get() {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        const data = await response.json();
        return data.record;
    },

    async update(data) {
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
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
            if (!this.data.vehicles) {
                this.data.vehicles = [];
            }
            if (!this.data.bookings) {
                this.data.bookings = [];
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

    async deleteBooking(bookingId) {
        await this.loadData();
        this.data.bookings = this.data.bookings.filter(b => b.id !== bookingId);
        await this.saveData();
        return true;
    }

    async returnVehicle(bookingId) {
        return await this.deleteBooking(bookingId);
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
}

const dataManager = new DataManager();
