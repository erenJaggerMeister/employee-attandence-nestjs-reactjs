const { Module } = require('@nestjs/common');
const { AttendanceController } = require('./controller/attendance.controller');
const { AttendanceService } = require('./service/attendance.service');

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
class AppModule {}

module.exports = { AppModule };
