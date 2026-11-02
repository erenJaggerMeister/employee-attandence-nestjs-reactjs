const { Module } = require('@nestjs/common');
const { AttendanceController } = require('./controller/attendance.controller');
const { AttendanceGatewayService } = require('./service/attendance-gateway.service');

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceGatewayService],
})
class AppModule {}

module.exports = { AppModule };
