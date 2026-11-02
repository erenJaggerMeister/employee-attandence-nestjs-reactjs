class AttendanceReportMapper {
  static formatDuration(totalSeconds) {
    if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds <= 0) return '-';
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  static formatTimeOnly(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  static toCompanyRecord(attendance, employee) {
    return {
      attendanceId: attendance.id,
      employeeId: attendance.employeeId,
      nik: employee ? employee.nik : '-',
      namaLengkap: employee ? employee.namaLengkap : 'Unknown',
      divisi: employee ? employee.divisiName : '-',
      jabatan: employee ? employee.jabatanName : '-',
      attendanceDate: attendance.attendanceDate,
      checkInTime: attendance.checkInTime,
      checkInTimeFormatted: this.formatTimeOnly(attendance.checkInTime),
      checkInPhoto: attendance.checkInPhoto,
      checkOutTime: attendance.checkOutTime,
      checkOutTimeFormatted: this.formatTimeOnly(attendance.checkOutTime),
      checkOutPhoto: attendance.checkOutPhoto,
      workDurationSeconds: attendance.workDurationSeconds,
      workDurationFormatted: this.formatDuration(attendance.workDurationSeconds),
    };
  }

  static toCompanyRecords(attendances, employees) {
    const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
    return attendances.map(a => this.toCompanyRecord(a, empMap[a.employeeId]));
  }
}

module.exports = { AttendanceReportMapper };
