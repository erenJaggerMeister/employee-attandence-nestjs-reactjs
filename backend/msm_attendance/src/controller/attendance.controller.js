const { Controller, Get, Post, Param, Body, Inject } = require('@nestjs/common');
const { AttendanceService } = require('../service/attendance.service');

@Controller('attendances')
class AttendanceController {
  constructor(@Inject(AttendanceService) attendanceService) {
    this.attendanceService = attendanceService;
  }

  @Get('all')
  async getAll() {
    return this.attendanceService.findAll();
  }

  @Get('today/:employeeId')
  async getToday(@Param('employeeId') employeeId) {
    return this.attendanceService.findTodayByEmployeeId(employeeId);
  }

  @Get('employee/:employeeId')
  async getHistory(@Param('employeeId') employeeId) {
    return this.attendanceService.findHistoryByEmployeeId(employeeId);
  }

  @Post('check-in')
  async checkIn(@Body() body) {
    return this.attendanceService.checkIn(body);
  }

  @Post('check-out')
  async checkOut(@Body() body) {
    return this.attendanceService.checkOut(body);
  }
}

AttendanceController.parameters = [AttendanceService];

module.exports = { AttendanceController };
