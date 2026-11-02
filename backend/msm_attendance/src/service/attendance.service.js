const { Injectable, BadRequestException, NotFoundException } = require('@nestjs/common');
const { pool } = require('../../../common/db');
const { AttendanceMapper } = require('../mapper/attendance.mapper');

@Injectable()
class AttendanceService {
  async findTodayByEmployeeId(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    const res = await pool.query(
      `SELECT * FROM attendances WHERE employee_id = $1 AND attendance_date = $2;`,
      [employeeId, today]
    );
    if (res.rows.length === 0) return null;
    return AttendanceMapper.toResponse(res.rows[0]);
  }

  async findHistoryByEmployeeId(employeeId) {
    const res = await pool.query(
      `SELECT * FROM attendances WHERE employee_id = $1 ORDER BY attendance_date DESC;`,
      [employeeId]
    );
    return AttendanceMapper.toResponseList(res.rows);
  }

  async findAll() {
    const res = await pool.query(
      `SELECT * FROM attendances ORDER BY attendance_date DESC, check_in_time DESC;`
    );
    return AttendanceMapper.toResponseList(res.rows);
  }

  async checkIn(dto) {
    const today = dto.attendanceDate || new Date().toISOString().split('T')[0];
    const checkInTime = dto.checkInTime || new Date().toISOString();

    const existing = await pool.query(
      `SELECT id FROM attendances WHERE employee_id = $1 AND attendance_date = $2;`,
      [dto.employeeId, today]
    );

    if (existing.rows.length > 0) {
      throw new BadRequestException('Anda sudah melakukan absensi masuk hari ini');
    }

    const res = await pool.query(
      `INSERT INTO attendances (
        employee_id, attendance_date, check_in_time, check_in_photo, work_duration_seconds
      ) VALUES ($1, $2, $3, $4, 0)
      RETURNING *;`,
      [dto.employeeId, today, checkInTime, dto.photo]
    );

    return AttendanceMapper.toResponse(res.rows[0]);
  }

  async checkOut(dto) {
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = dto.checkOutTime || new Date().toISOString();

    const existing = await pool.query(
      `SELECT * FROM attendances WHERE employee_id = $1 AND attendance_date = $2;`,
      [dto.employeeId, today]
    );

    if (existing.rows.length === 0) {
      throw new BadRequestException('Belum ada data absensi masuk untuk hari ini');
    }

    const currentRecord = existing.rows[0];
    if (currentRecord.check_out_time) {
      throw new BadRequestException('Anda sudah melakukan absensi keluar untuk hari ini');
    }

    const checkInDate = new Date(currentRecord.check_in_time);
    const checkOutDate = new Date(checkOutTime);
    const durationSeconds = Math.max(0, Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / 1000));

    const res = await pool.query(
      `UPDATE attendances
       SET 
         check_out_time = $1,
         check_out_photo = $2,
         work_duration_seconds = $3,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *;`,
      [checkOutTime, dto.photo, durationSeconds, currentRecord.id]
    );

    return AttendanceMapper.toResponse(res.rows[0]);
  }
}

module.exports = { AttendanceService };
