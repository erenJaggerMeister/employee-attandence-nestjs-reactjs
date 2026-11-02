const { Controller, Get, Post, Param, Body, Inject } = require('@nestjs/common');
const { JabatanService } = require('../service/jabatan.service');

@Controller('jabatans')
class JabatanController {
  constructor(@Inject(JabatanService) jabatanService) {
    this.jabatanService = jabatanService;
  }

  @Get()
  async getAll() {
    return this.jabatanService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id) {
    return this.jabatanService.findById(id);
  }

  @Post()
  async create(@Body() body) {
    return this.jabatanService.create(body);
  }
}

JabatanController.parameters = [JabatanService];

module.exports = { JabatanController };
