const { Controller, Get, Post, Put, Param, Query, Body, Inject } = require('@nestjs/common');
const { EmployeeService } = require('../service/employee.service');

@Controller('employees')
class EmployeeController {
  constructor(@Inject(EmployeeService) employeeService) {
    this.employeeService = employeeService;
  }

  @Get()
  async getAll(
    @Query('search') search,
    @Query('divisionId') divisionId,
    @Query('page') page,
    @Query('limit') limit,
  ) {
    return this.employeeService.findAll({ search, divisionId, page, limit });
  }

  @Get('by-user/:userId')
  async getByUserId(@Param('userId') userId) {
    return this.employeeService.findByUserId(userId);
  }

  @Get(':id')
  async getById(@Param('id') id) {
    return this.employeeService.findById(id);
  }

  @Post()
  async create(@Body() body) {
    return this.employeeService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id, @Body() body) {
    return this.employeeService.update(id, body);
  }
}

EmployeeController.parameters = [EmployeeService];

module.exports = { EmployeeController };
