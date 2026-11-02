const { Injectable, BadRequestException, ForbiddenException, NotFoundException } = require('@nestjs/common');
const { AttendanceClient } = require('../client/attendance.client');
const { EmployeeClient } = require('../client/employee.client');
const { AttendanceReportMapper } = require('../mapper/attendance-report.mapper');
const { ExcelReportService } = require('./excel-report.service');

@Injectable()
class AttendanceGatewayService {
  constructor() {
    this.attendanceClient = new AttendanceClient();
    this.employeeClient = new EmployeeClient();
  }

  async getTodayStatus(user) {
    if (!user.employeeId) {
      const emp = await this.employeeClient.getEmployeeByUserId(user.userId);
      if (!emp) throw new NotFoundException('Data pegawai tidak ditemukan');
      user.employeeId = emp.id;
    }

    const todayRecord = await this.attendanceClient.getToday(user.employeeId);
    if (!todayRecord) {
      return {
        hasCheckedIn: false,
        isWorking: false,
        hasCheckedOut: false,
        status: 'Belum Hadir',
        record: null,
      };
    }

    if (!todayRecord.checkOutTime) {
      return {
        hasCheckedIn: true,
        isWorking: true,
        hasCheckedOut: false,
        status: 'Sedang Bekerja',
        checkInTime: todayRecord.checkInTime,
        record: todayRecord,
      };
    }

    return {
      hasCheckedIn: true,
      isWorking: false,
      hasCheckedOut: true,
      status: 'Telah Pulang',
      checkInTime: todayRecord.checkInTime,
      checkOutTime: todayRecord.checkOutTime,
      workDurationFormatted: todayRecord.workDurationFormatted,
      record: todayRecord,
    };
  }

  async checkIn(user, photo) {
    if (!photo || !photo.startsWith('data:image')) {
      throw new BadRequestException('Foto bukti kehadiran wajib diambil (format Data URI Base64)');
    }

    if (!user.employeeId) {
      const emp = await this.employeeClient.getEmployeeByUserId(user.userId);
      if (!emp) throw new NotFoundException('Data pegawai tidak ditemukan');
      user.employeeId = emp.id;
    }

    const result = await this.attendanceClient.checkIn({
      employeeId: user.employeeId,
      photo,
      attendanceDate: new Date().toISOString().split('T')[0],
      checkInTime: new Date().toISOString(),
    });

    return {
      message: 'Absensi masuk berhasil dicatat',
      status: 'Sedang Bekerja',
      data: result,
    };
  }

  async checkOut(user, photo) {
    if (!photo || !photo.startsWith('data:image')) {
      throw new BadRequestException('Foto bukti keluar wajib diambil (format Data URI Base64)');
    }

    if (!user.employeeId) {
      const emp = await this.employeeClient.getEmployeeByUserId(user.userId);
      if (!emp) throw new NotFoundException('Data pegawai tidak ditemukan');
      user.employeeId = emp.id;
    }

    const result = await this.attendanceClient.checkOut({
      employeeId: user.employeeId,
      photo,
      checkOutTime: new Date().toISOString(),
    });

    return {
      message: 'Absensi keluar berhasil dicatat',
      status: 'Telah Pulang',
      data: result,
    };
  }

  // Sesuai skenario spesifik user: /api/msf_attendance/user/{userId} dengan Bearer Token JWT
  async getUserHistory(requestingUser, targetUserId) {
    // 1. Strict ID & Token Isolation
    if (requestingUser.role !== 'HRD' && requestingUser.userId !== targetUserId) {
      throw new ForbiddenException('Akses ditolak: Anda dilarang mengakses riwayat absensi pegawai lain');
    }

    // 2. Lookup employee record
    const emp = await this.employeeClient.getEmployeeByUserId(targetUserId);
    if (!emp) {
      return [];
    }

    // 3. Fetch history
    const history = await this.attendanceClient.getEmployeeHistory(emp.id);
    return history;
  }

  async getCompanyHistory() {
    const [attendances, employees] = await Promise.all([
      this.attendanceClient.getAllAttendances(),
      this.employeeClient.getAllEmployees(),
    ]);

    return AttendanceReportMapper.toCompanyRecords(attendances, employees);
  }

  async getExcelWorkbook() {
    const companyRecords = await this.getCompanyHistory();
    return ExcelReportService.generateWorkbook(companyRecords);
  }
}

module.exports = { AttendanceGatewayService };
