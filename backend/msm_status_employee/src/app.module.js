const { Module } = require('@nestjs/common');
const { StatusEmployeeController } = require('./controller/status-employee.controller');
const { StatusEmployeeService } = require('./service/status-employee.service');

@Module({
  controllers: [StatusEmployeeController],
  providers: [StatusEmployeeService],
})
class AppModule {}

module.exports = { AppModule };
