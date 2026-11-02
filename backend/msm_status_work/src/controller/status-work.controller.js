const { Controller, Get, Param, Inject } = require('@nestjs/common');
const { StatusWorkService } = require('../service/status-work.service');

@Controller('status-works')
class StatusWorkController {
  constructor(@Inject(StatusWorkService) statusWorkService) {
    this.statusWorkService = statusWorkService;
  }

  @Get()
  async getAll() {
    return this.statusWorkService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id) {
    return this.statusWorkService.findById(id);
  }
}

StatusWorkController.parameters = [StatusWorkService];

module.exports = { StatusWorkController };
