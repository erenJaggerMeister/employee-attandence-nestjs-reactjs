const { Controller, Get, Param, Inject } = require('@nestjs/common');
const { StatusEmployeeService } = require('../service/status-employee.service');

@Controller('status-employees')
class StatusEmployeeController {
  constructor(@Inject(StatusEmployeeService) statusEmployeeService) {
    this.statusEmployeeService = statusEmployeeService;
  }

  @Get()
  async getAll() {
    return this.statusEmployeeService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id) {
    return this.statusEmployeeService.findById(id);
  }
}

StatusEmployeeController.parameters = [StatusEmployeeService];

module.exports = { StatusEmployeeController };
