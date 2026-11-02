const { Module } = require('@nestjs/common');
const { EmployeeController } = require('./controller/employee.controller');
const { EmployeeService } = require('./service/employee.service');

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
class AppModule {}

module.exports = { AppModule };
