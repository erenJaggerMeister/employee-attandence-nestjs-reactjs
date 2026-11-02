const { Module } = require('@nestjs/common');
const { EmployeeController } = require('./controller/employee.controller');
const { EmployeeGatewayService } = require('./service/employee-gateway.service');

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeGatewayService],
})
class AppModule {}

module.exports = { AppModule };
