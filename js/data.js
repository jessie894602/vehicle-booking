// 车辆预定系统 - 数据模块

// 数据字段定义
const FIELD_NAMES = {
    reason: 'fldpOINl5Y',           // 申请原因 (主键)
    model: 'fld9EhE4w7',            // 车辆型号
    code: 'fldfXsACus',             // 车辆编码
    city: 'fldiE03aW8',             // 车辆城市
    vin: 'fldZCsF3JK',              // VIN码
    series: 'fldUSKR9E9',           // 车系
    vehicle: 'fldUSM0pQi',          // 车辆
    stage: 'fldi8ajQO0',            // 车辆阶段
    startTime: 'fldi5iH52j',        // 选择开始时间
    endTime: 'fldsl8nK3P',          // 选择结束时间
    person: 'fldweu5QVK',           // 人员
    color: 'fldColor',              // 内外饰颜色
    plateNumber: 'fldPlateNumber',  // 车牌号
    location: 'fldLocation'         // 车辆位置
};

// 真实车辆数据（来自产品部车辆管理清单.csv）
const VEHICLES = [
    {
        id: 'VEH001',
        [FIELD_NAMES.code]: '765772',
        [FIELD_NAMES.model]: 'Model3',
        [FIELD_NAMES.color]: 'Model3白色黑色黑色 5座',
        [FIELD_NAMES.plateNumber]: '京ACV6773',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LRW3E7EKXSC495307',
        [FIELD_NAMES.series]: '特斯拉',
        [FIELD_NAMES.vehicle]: 'Model3',
        [FIELD_NAMES.stage]: 'SOP',
        image: 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=Model3'
    },
    {
        id: 'VEH002',
        [FIELD_NAMES.code]: '763702',
        [FIELD_NAMES.model]: 'W02 Ultra',
        [FIELD_NAMES.color]: '小象灰拼黑外/黑深灰灰内/ULTRA/21寸全涂轮',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '常州市',
        [FIELD_NAMES.city]: '常州市',
        [FIELD_NAMES.vin]: 'HLX13B176S1200049',
        [FIELD_NAMES.series]: 'W02',
        [FIELD_NAMES.vehicle]: 'W02 Ultra',
        [FIELD_NAMES.stage]: 'PPV',
        image: 'https://via.placeholder.com/400x300/6A4C93/ffffff?text=W02'
    },
    {
        id: 'VEH003',
        [FIELD_NAMES.code]: '763520',
        [FIELD_NAMES.model]: 'MEGA MAX',
        [FIELD_NAMES.color]: '科技绿/爱马仕橙/HRE/7座',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'HLX14B170S1996293',
        [FIELD_NAMES.series]: '理想MEGA',
        [FIELD_NAMES.vehicle]: 'MEGA MAX',
        [FIELD_NAMES.stage]: 'EP2',
        image: 'https://via.placeholder.com/400x300/9B59B6/ffffff?text=MEGA+MAX'
    },
    {
        id: 'VEH004',
        [FIELD_NAMES.code]: '597940',
        [FIELD_NAMES.model]: 'L9-2024款 Ultra',
        [FIELD_NAMES.color]: '银色金属漆黑白双色内饰',
        [FIELD_NAMES.plateNumber]: '京AFD3265',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'HLX33B122R0040653',
        [FIELD_NAMES.series]: '理想L9',
        [FIELD_NAMES.vehicle]: 'L9-2024款 Ultra',
        [FIELD_NAMES.stage]: 'SOP',
        image: 'https://via.placeholder.com/400x300/8B4789/ffffff?text=L9+Ultra'
    },
    {
        id: 'VEH005',
        [FIELD_NAMES.code]: '521763',
        [FIELD_NAMES.model]: 'L7-2024款 Ultra',
        [FIELD_NAMES.color]: '银色金属漆黑白双色内饰',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'HLX33B123R1616504',
        [FIELD_NAMES.series]: '理想L7',
        [FIELD_NAMES.vehicle]: 'L7-2024款 Ultra',
        [FIELD_NAMES.stage]: 'P',
        image: 'https://via.placeholder.com/400x300/6A4C93/ffffff?text=L7+Ultra'
    },
    {
        id: 'VEH006',
        [FIELD_NAMES.code]: '511928',
        [FIELD_NAMES.model]: 'MEGA-Ultra',
        [FIELD_NAMES.color]: '银色金属漆白色内饰',
        [FIELD_NAMES.plateNumber]: '琼BD03216',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'HLX14B17XR0000076',
        [FIELD_NAMES.series]: '理想MEGA',
        [FIELD_NAMES.vehicle]: 'MEGA-Ultra',
        [FIELD_NAMES.stage]: 'P',
        image: 'https://via.placeholder.com/400x300/7B2CBF/ffffff?text=MEGA+Ultra'
    },
    {
        id: 'VEH007',
        [FIELD_NAMES.code]: '509697',
        [FIELD_NAMES.model]: '问界M7',
        [FIELD_NAMES.color]: '黑色黑色白色 5座',
        [FIELD_NAMES.plateNumber]: '京AFM9977',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LM8F7E896RA003696',
        [FIELD_NAMES.series]: '问界',
        [FIELD_NAMES.vehicle]: '问界M7',
        [FIELD_NAMES.stage]: 'SOP',
        image: 'https://via.placeholder.com/400x300/3498DB/ffffff?text=M7'
    },
    {
        id: 'VEH008',
        [FIELD_NAMES.code]: '498717',
        [FIELD_NAMES.model]: '小鹏G6',
        [FIELD_NAMES.color]: '银色黑色白色 5座',
        [FIELD_NAMES.plateNumber]: '京AC68509',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'L1NNSGHA8PB044391',
        [FIELD_NAMES.series]: '小鹏G6',
        [FIELD_NAMES.vehicle]: '小鹏G6',
        [FIELD_NAMES.stage]: 'SOP',
        image: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=XPeng+G6'
    },
    {
        id: 'VEH009',
        [FIELD_NAMES.code]: '469021',
        [FIELD_NAMES.model]: 'L8 Pro',
        [FIELD_NAMES.color]: '黑色',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'HLX33B121P1765281',
        [FIELD_NAMES.series]: '理想L8',
        [FIELD_NAMES.vehicle]: 'L8 Pro',
        [FIELD_NAMES.stage]: 'PPV1',
        image: 'https://via.placeholder.com/400x300/5D3A9B/ffffff?text=L8+Pro'
    },
    {
        id: 'VEH010',
        [FIELD_NAMES.code]: '469008',
        [FIELD_NAMES.model]: 'L7 Ultra',
        [FIELD_NAMES.color]: '黑色',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'HLX33B122P1756105',
        [FIELD_NAMES.series]: '理想L7',
        [FIELD_NAMES.vehicle]: 'L7 Ultra',
        [FIELD_NAMES.stage]: 'PPV1',
        image: 'https://via.placeholder.com/400x300/4A148C/ffffff?text=L7+Ultra'
    },
    {
        id: 'VEH011',
        [FIELD_NAMES.code]: '400404',
        [FIELD_NAMES.model]: 'L7 Ultra',
        [FIELD_NAMES.color]: '银色金属漆黑色运动内饰',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LW433B124P1631738',
        [FIELD_NAMES.series]: '理想L7',
        [FIELD_NAMES.vehicle]: 'L7 Ultra',
        [FIELD_NAMES.stage]: 'EP2',
        image: 'https://via.placeholder.com/400x300/6A1B9A/ffffff?text=L7+Ultra'
    },
    {
        id: 'VEH012',
        [FIELD_NAMES.code]: '388852',
        [FIELD_NAMES.model]: 'L7 Pro',
        [FIELD_NAMES.color]: '灰色金属漆黑橙双色内饰',
        [FIELD_NAMES.plateNumber]: '京AFJ4863',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LW433B12XP1605080',
        [FIELD_NAMES.series]: '理想L7',
        [FIELD_NAMES.vehicle]: 'L7 Pro',
        [FIELD_NAMES.stage]: 'SOP',
        image: 'https://via.placeholder.com/400x300/8E44AD/ffffff?text=L7+Pro'
    },
    {
        id: 'VEH013',
        [FIELD_NAMES.code]: '335496',
        [FIELD_NAMES.model]: 'L7-2022款',
        [FIELD_NAMES.color]: '黑橙配色',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LW433B12XN1601155',
        [FIELD_NAMES.series]: '理想L7',
        [FIELD_NAMES.vehicle]: 'L7-2022款',
        [FIELD_NAMES.stage]: 'PP3',
        image: 'https://via.placeholder.com/400x300/9B59B6/ffffff?text=L7+2022'
    },
    {
        id: 'VEH014',
        [FIELD_NAMES.code]: '294947',
        [FIELD_NAMES.model]: 'L8 Max',
        [FIELD_NAMES.color]: '黑灰',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LW433B125N1002874',
        [FIELD_NAMES.series]: '理想L8',
        [FIELD_NAMES.vehicle]: 'L8 Max',
        [FIELD_NAMES.stage]: 'P1',
        image: 'https://via.placeholder.com/400x300/AF69BD/ffffff?text=L8+Max'
    },
    {
        id: 'VEH015',
        [FIELD_NAMES.code]: '243800',
        [FIELD_NAMES.model]: 'L9 Max',
        [FIELD_NAMES.color]: '灰色金属漆橙色皮革内饰',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LW433B126N1000597',
        [FIELD_NAMES.series]: '理想L9',
        [FIELD_NAMES.vehicle]: 'L9 Max',
        [FIELD_NAMES.stage]: 'P',
        image: 'https://via.placeholder.com/400x300/BA68C8/ffffff?text=L9+Max'
    },
    {
        id: 'VEH016',
        [FIELD_NAMES.code]: '65498',
        [FIELD_NAMES.model]: 'ONE-2021款',
        [FIELD_NAMES.color]: '黑色金属漆黑色皮革内饰',
        [FIELD_NAMES.plateNumber]: '',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LW433B110M1005123',
        [FIELD_NAMES.series]: '理想ONE',
        [FIELD_NAMES.vehicle]: 'ONE-2021款',
        [FIELD_NAMES.stage]: 'PPV1',
        image: 'https://via.placeholder.com/400x300/CE93D8/ffffff?text=ONE+2021'
    },
    {
        id: 'VEH017',
        [FIELD_NAMES.code]: '43548',
        [FIELD_NAMES.model]: 'Model 3',
        [FIELD_NAMES.color]: '灰色双色黑色',
        [FIELD_NAMES.plateNumber]: '京AD15829',
        [FIELD_NAMES.location]: '北京市',
        [FIELD_NAMES.city]: '北京市',
        [FIELD_NAMES.vin]: 'LRW3E7EAXLC020104',
        [FIELD_NAMES.series]: '特斯拉',
        [FIELD_NAMES.vehicle]: 'Model 3',
        [FIELD_NAMES.stage]: 'SOP',
        image: 'https://via.placeholder.com/400x300/2196F3/ffffff?text=Model+3'
    }
];

// 数据管理类
class DataManager {
    constructor() {
        this.STORAGE_KEY_VEHICLES = 'vehicle_booking_vehicles';
        this.STORAGE_KEY_BOOKINGS = 'vehicle_booking_records';
        this.STORAGE_KEY_STATISTICS = 'vehicle_usage_statistics';
        this.initializeData();
    }

    // 初始化数据
    initializeData() {
        if (!localStorage.getItem(this.STORAGE_KEY_VEHICLES)) {
            this.saveVehicles(VEHICLES);
        }
        if (!localStorage.getItem(this.STORAGE_KEY_BOOKINGS)) {
            localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEY_STATISTICS)) {
            localStorage.setItem(this.STORAGE_KEY_STATISTICS, JSON.stringify({}));
        }
    }

    // 获取所有车辆
    getAllVehicles() {
        const data = localStorage.getItem(this.STORAGE_KEY_VEHICLES);
        return data ? JSON.parse(data) : VEHICLES;
    }

    // 保存车辆数据
    saveVehicles(vehicles) {
        localStorage.setItem(this.STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
    }

    // 根据ID获取车辆
    getVehicleById(id) {
        const vehicles = this.getAllVehicles();
        return vehicles.find(v => v.id === id);
    }

    // 更新车辆信息
    updateVehicle(vehicleId, updates) {
        const vehicles = this.getAllVehicles();
        const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
        if (vehicleIndex !== -1) {
            vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], ...updates };
            this.saveVehicles(vehicles);
            return true;
        }
        return false;
    }

    // 获取所有预定记录
    getAllBookings() {
        const data = localStorage.getItem(this.STORAGE_KEY_BOOKINGS);
        return data ? JSON.parse(data) : [];
    }

    // 添加预定记录
    addBooking(booking) {
        const bookings = this.getAllBookings();
        booking.id = 'BOOK' + Date.now();
        booking.createdAt = new Date().toISOString();
        booking.returned = false; // 默认未还车
        booking.returnedAt = null; // 还车时间
        bookings.push(booking);
        localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
        return booking;
    }

    // 还车（自动删除并记录统计）
    returnVehicle(bookingId) {
        const bookings = this.getAllBookings();
        const booking = bookings.find(b => b.id === bookingId);

        if (booking) {
            // 记录使用统计
            this.recordUsageStatistics(booking);

            // 删除预定记录
            const updatedBookings = bookings.filter(b => b.id !== bookingId);
            localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(updatedBookings));
            return true;
        }
        return false;
    }

    // 记录使用统计
    recordUsageStatistics(booking) {
        const statistics = this.getAllStatistics();
        const vehicleId = booking.vehicleId;

        // 计算使用时长（小时）
        const startTime = new Date(booking[FIELD_NAMES.startTime]);
        const endTime = new Date(booking[FIELD_NAMES.endTime]);
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);

        if (!statistics[vehicleId]) {
            statistics[vehicleId] = {
                totalUsages: 0,
                totalHours: 0,
                lastUsedTime: null,
                users: {}
            };
        }

        const stat = statistics[vehicleId];
        stat.totalUsages += 1;
        stat.totalHours += durationHours;
        stat.lastUsedTime = new Date().toISOString();

        // 记录用户使用次数
        const userName = booking[FIELD_NAMES.person];
        if (!stat.users[userName]) {
            stat.users[userName] = 0;
        }
        stat.users[userName] += 1;

        localStorage.setItem(this.STORAGE_KEY_STATISTICS, JSON.stringify(statistics));
    }

    // 获取所有统计数据
    getAllStatistics() {
        const data = localStorage.getItem(this.STORAGE_KEY_STATISTICS);
        return data ? JSON.parse(data) : {};
    }

    // 获取单个车辆的统计
    getVehicleStatistics(vehicleId) {
        const statistics = this.getAllStatistics();
        return statistics[vehicleId] || {
            totalUsages: 0,
            totalHours: 0,
            lastUsedTime: null,
            users: {}
        };
    }

    // 清除统计数据
    clearStatistics() {
        localStorage.setItem(this.STORAGE_KEY_STATISTICS, JSON.stringify({}));
        return true;
    }

    // 删除预定记录
    deleteBooking(bookingId) {
        let bookings = this.getAllBookings();
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
        return true;
    }

    // 清除所有预定记录
    clearAllBookings() {
        localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify([]));
        return true;
    }

    // 清除已还车的记录
    clearReturnedBookings() {
        let bookings = this.getAllBookings();
        bookings = bookings.filter(b => !b.returned);
        localStorage.setItem(this.STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
        return true;
    }

    // 根据车辆ID获取预定记录
    getBookingsByVehicleId(vehicleId) {
        const bookings = this.getAllBookings();
        return bookings.filter(b => b.vehicleId === vehicleId);
    }

    // 检查时间段是否冲突
    checkTimeConflict(vehicleId, startTime, endTime, excludeBookingId = null) {
        const bookings = this.getBookingsByVehicleId(vehicleId);
        const start = new Date(startTime);
        const end = new Date(endTime);

        for (const booking of bookings) {
            if (excludeBookingId && booking.id === excludeBookingId) {
                continue;
            }

            const bookingStart = new Date(booking[FIELD_NAMES.startTime]);
            const bookingEnd = new Date(booking[FIELD_NAMES.endTime]);

            // 检查时间重叠
            if (start < bookingEnd && end > bookingStart) {
                return true;
            }
        }
        return false;
    }

    // 检查车辆当前是否在使用中
    isVehicleInUse(vehicleId) {
        const bookings = this.getBookingsByVehicleId(vehicleId);
        const now = new Date();

        for (const booking of bookings) {
            const startTime = new Date(booking[FIELD_NAMES.startTime]);
            const endTime = new Date(booking[FIELD_NAMES.endTime]);

            // 检查当前时间是否在预定时间段内
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

    // 获取车辆状态信息
    getVehicleStatus(vehicleId) {
        const status = this.isVehicleInUse(vehicleId);

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

// 导出数据管理实例
const dataManager = new DataManager();
