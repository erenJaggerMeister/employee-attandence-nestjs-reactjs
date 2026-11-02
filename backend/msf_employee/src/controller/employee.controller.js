const { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Inject } = require('@nestjs/common');
const { EmployeeGatewayService } = require('../service/employee-gateway.service');
const { RoleGuard } = require('../../../common/auth.guard');

const HrdOnlyGuard = RoleGuard('HRD');

@Controller('api/msf_employee')
@UseGuards(HrdOnlyGuard)
class EmployeeController {
  constructor(@Inject(EmployeeGatewayService) employeeGatewayService) {
    this.employeeGatewayService = employeeGatewayService;
  }

  @Get('grid')
  async getGrid(
    @Query('search') search,
    @Query('divisionId') divisionId,
    @Query('page') page,
    @Query('limit') limit,
  ) {
    return this.employeeGatewayService.getGrid({ search, divisionId, page, limit });
  }

  @Get('lookup/masters')
  async getLookups() {
    return this.employeeGatewayService.getLookups();
  }

  @Get(':id')
  async getDetail(@Param('id') id) {
    return this.employeeGatewayService.getDetail(id);
  }

  @Post()
  async create(@Body() body) {
    return this.employeeGatewayService.createEmployeeWithUser(body);
  }

  @Put(':id')
  async update(@Param('id') id, @Body() body) {
    return this.employeeGatewayService.updateEmployee(id, body);
  }
}

EmployeeController.parameters = [EmployeeGatewayService];

module.exports = { EmployeeController };
