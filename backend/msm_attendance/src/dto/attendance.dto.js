class CheckInDto {
  constructor({ employeeId, photo, attendanceDate, checkInTime }) {
    this.employeeId = employeeId;
    this.photo = photo;
    this.attendanceDate = attendanceDate || new Date().toISOString().split('T')[0];
    this.checkInTime = checkInTime || new Date().toISOString();
  }
}

class CheckOutDto {
  constructor({ employeeId, photo, checkOutTime }) {
    this.employeeId = employeeId;
    this.photo = photo;
    this.checkOutTime = checkOutTime || new Date().toISOString();
  }
}

module.exports = { CheckInDto, CheckOutDto };
