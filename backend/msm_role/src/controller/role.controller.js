const { Controller, Get, Post, Param, Body, Inject } = require('@nestjs/common');
const { RoleService } = require('../service/role.service');

@Controller('roles')
class RoleController {
  constructor(@Inject(RoleService) roleService) {
    this.roleService = roleService;
  }

  @Get()
  async getAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id) {
    return this.roleService.findById(id);
  }

  @Post()
  async create(@Body() body) {
    return this.roleService.create(body);
  }
}

RoleController.parameters = [RoleService];

module.exports = { RoleController };
