const { Controller, Get, Post, Param, Query, Body, Inject } = require('@nestjs/common');
const { UserService } = require('../service/user.service');

@Controller('users')
class UserController {
  constructor(@Inject(UserService) userService) {
    this.userService = userService;
  }

  @Get('by-email')
  async getByEmail(@Query('email') email, @Query('auth') auth) {
    const includePassword = auth === 'true';
    return this.userService.findByEmail(email, includePassword);
  }

  @Get(':id')
  async getById(@Param('id') id) {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() body) {
    return this.userService.create(body);
  }
}

UserController.parameters = [UserService];

module.exports = { UserController };
