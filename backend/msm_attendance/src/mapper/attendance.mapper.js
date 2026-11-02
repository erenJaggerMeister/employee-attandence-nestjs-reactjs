class AttendanceMapper {
  static formatDuration(totalSeconds) {
    if (totalSeconds == null || isNaN(totalSeconds)) return '-';
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  static toResponse(row) {
    if (!row) return null;
    const durSec = row.work_duration_seconds;
    return {
      id: row.id,
      employeeId: row.employee_id,
      attendanceDate: row.attendance_date ? new Date(row.attendance_date).toISOString().split('T')[0] : null,
      checkInTime: row.check_in_time,
      checkInPhoto: row.check_in_photo,
      checkOutTime: row.check_out_time,
      checkOutPhoto: row.check_out_photo,
      workDurationSeconds: durSec,
      workDurationFormatted: this.formatDuration(durSec),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static toResponseList(rows) {
    return (rows || []).map(r => this.toResponse(r));
  }
}

module.exports = { AttendanceMapper };
